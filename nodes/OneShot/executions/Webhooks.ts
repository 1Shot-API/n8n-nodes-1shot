import {
	IDataObject,
	INodeExecutionData,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { verifyAsync } from '../crypto/ED25519';
import { getX402Supported, settleX402Payment, verifyX402Payment } from './x402';
import { IPaymentPayload, IPaymentRequirements, IX402ErrorResponse } from '../types/1shot';
import { isIpWhitelisted, setupOutputConnection } from '../utils/webhookUtils';
// import { rm, } from 'fs/promises';
import type * as express from 'express';

// Static data did not seem to update quickly enough, so we'll use a global variable to track the registration process.
// This will have problems if you are running multiple instances of the node.
let x402ScanRegistrationInProcess = false;

export async function webhookTrigger(this: IWebhookFunctions): Promise<IWebhookResponseData> {
	const webhookType = this.getNodeParameter('webhookType') as string;
	const body = this.getBodyData();

	if (webhookType === 'oneshot') {
		return await handleOneShotWebhook.call(this, body);
	} else if (webhookType === 'x402') {
		return await handleX402Webhook.call(this, body);
	} else {
		throw new Error(`Unsupported webhook type: ${webhookType}`);
	}
}

async function handleOneShotWebhook(
	this: IWebhookFunctions,
	body: IDataObject,
): Promise<IWebhookResponseData> {
	const publicKey = this.getNodeParameter('publicKey') as string;
	const signature = body.signature as string;

	if (!signature) {
		throw new Error('No signature provided in webhook payload');
	}

	// Remove signature from body before verification
	const { signature: _, ...payloadWithoutSignature } = body;

	const isValid = await verify1ShotSignature(publicKey, signature, payloadWithoutSignature);
	if (!isValid) {
		throw new Error('1Shot: Signature verification failed');
	}

	return {
		workflowData: [
			[
				{
					json: body,
				},
			],
		],
	};
}

async function handleX402Webhook(
	this: IWebhookFunctions,
	_body: IDataObject,
): Promise<IWebhookResponseData> {
	const responseMode = this.getNodeParameter('responseMode', 'onReceived') as string;

	// We will store whether or not the node has registered on x402Scan.
	const nodeStaticData = this.getWorkflowStaticData('node');

	const options = this.getNodeParameter('options', {}) as {
		binaryData: boolean;
		ignoreBots: boolean;
		rawBody: boolean;
		responseData?: string;
		ipWhitelist?: string;
		resourceDescription: string;
		mimeType: string;
	};

	const headers = this.getHeaderData();
	const req = this.getRequestObject();
	const resp = this.getResponseObject();
	const requestMethod = this.getRequestObject().method;

	if (!isIpWhitelisted(options.ipWhitelist, req.ips, req.ip)) {
		resp.writeHead(403);
		resp.end('IP is not whitelisted to access the webhook!');
		return { noWebhookResponse: true };
	}

	// All of this is left here and commented out because it relies on 3rd party and/or node.js libraries that I am not sure I am allowed to use.
	// Once I get an answer from the n8n team, I will either uncomment this or remove it entirely.

	// let validationData: IDataObject | undefined;
	// try {
	// 	if (options.ignoreBots && isbot(req.headers['user-agent']))
	// 		throw new WebhookAuthorizationError(403);
	// 	validationData = await this.validateAuth(context);
	// } catch (error) {
	// 	if (error instanceof WebhookAuthorizationError) {
	// 		resp.writeHead(error.responseCode, { 'WWW-Authenticate': 'Basic realm="Webhook"' });
	// 		resp.end(error.message);
	// 		return { noWebhookResponse: true };
	// 	}
	// 	throw error;
	// }

	const prepareOutput = setupOutputConnection(this, requestMethod, {
		// jwtPayload: validationData,
	});

	// if (options.binaryData) {
	// 	return await handleBinaryData(this, prepareOutput);
	// }

	// if (req.contentType === 'multipart/form-data') {
	// 	return await handleFormData(this, prepareOutput);
	// }

	// if (!req.body && !options.rawBody) {
	// 	try {
	// 		return await handleBinaryData(this, prepareOutput);
	// 	} catch (error) {}
	// }

	if (options.rawBody && !req.rawBody) {
		await req.readRawBody();
	}

	// Get the credential data (always available since it's required at node level)
	const credentials = await this.getCredentials('oneShotOAuth2Api');
	if (!credentials) {
		// This is an example of direct response with Express
		resp.writeHead(403);
		resp.end('oneShotOAuth2Api credential not found');
		return { noWebhookResponse: true };
	}

	// We need to get the supported tokens no matter what
	const supportedTokens = await getX402Supported(this);

	// We need to figure out which of the tokens have been configured for this node
	let configuredTokens = this.getNodeParameter('tokens') as {
		paymentToken: { paymentToken: string; payToAddress: string; paymentAmount: number }[];
	};

	if (configuredTokens == null) {
		configuredTokens = { paymentToken: [] };
	}

	const { resourceDescription, mimeType } = options;

	const responseData = this.getNodeParameter('responseData') as string;
	const httpMethod = this.getNodeParameter('httpMethod') as string;

	const webhookUrl = this.getNodeWebhookUrl('default');
	if (webhookUrl == null) {
		resp.writeHead(403);
		resp.end('webhookUrl not found');
		return { noWebhookResponse: true };
	}

	const shouldRegisterWithX402Scan =
		(nodeStaticData.x402ScanRegistered != webhookUrl ||
			nodeStaticData.resourceDescription != resourceDescription ||
			nodeStaticData.mimeType != mimeType) &&
		!x402ScanRegistrationInProcess &&
		(httpMethod === 'POST' || httpMethod === 'GET'); // Only register for POST and GET methods, X402 scan does not support other verbs

	// We'll register the webhook with x402Scan if it's not already registered.
	if (shouldRegisterWithX402Scan) {
		try {
			x402ScanRegistrationInProcess = true;
			await registerWebhookWithX402Scan(this, webhookUrl);
			nodeStaticData.x402ScanRegistered = webhookUrl;
			nodeStaticData.resourceDescription = resourceDescription;
			nodeStaticData.mimeType = mimeType;
			x402ScanRegistrationInProcess = false;
			this.logger.info('Successfully registered workflow on x402Scan');
		} catch (err) {
			this.logger.error('Error registering node on x402Scan:', err);
			x402ScanRegistrationInProcess = false;
		}
	}

	// We are going to loop over the configured tokens- only those are the supported ones.
	const paymentRequirements = new Array<PaymentRequirements>();
	const configuredKinds = new Array<string>();

	for (const configuredToken of configuredTokens.paymentToken) {
		// Find the supported token that matches the configured token
		// We need to split up the paymentToken string into the network and contract address.
		const [network, contractAddress] = configuredToken.paymentToken.split(':');

		// If the kind already has a configuration, that's an error- you can only configure one token per network.
		if (configuredKinds.includes(network)) {
			resp.writeHead(403);
			resp.end(
				`Misconfiguration: Network ${network} has multiple configured tokens. You may only have one payment token per network.`,
			);
			return { noWebhookResponse: true };
		}
		configuredKinds.push(network);

		// First we find the "kind" that matches the network.
		const kind = supportedTokens.kinds.find((kind) => kind.network === network);
		if (kind == null) {
			throw new Error(`Supported network ${network} not found`);
		}

		// Now we find the token that matches the contract address.
		const supportedToken = kind.tokens.find((token) => token.contractAddress === contractAddress);
		if (supportedToken == null) {
			throw new Error(`Supported token ${contractAddress} not found`);
		}

		// Now we create the payment config.
		paymentRequirements.push(
			new PaymentRequirements(
				kind.scheme,
				kind.network,
				configuredToken.paymentAmount.toString(),
				webhookUrl,
				resourceDescription || 'OneShot API Webhook',
				mimeType || 'application/json',
				undefined, // outputSchema is optional
				configuredToken.payToAddress,
				60,
				supportedToken.contractAddress,
				{
					name: supportedToken.name,
					version: supportedToken.version,
				},
			),
		);
	}

	// If there's no x-payment header, return a 402 error with payment details
	// TODO: Agent thinks this should not have the negation on it, I think it's right, but it currently works.
	const xPaymentHeader = headers['x-payment'];
	if (!xPaymentHeader == null || typeof xPaymentHeader !== 'string') {
		return generateX402Error(resp, 'No x-payment header provided', paymentRequirements);
	}

	// try to decode the x-payment header if it exists
	try {
		// Decode the x-payment header from base64
		const decodedXPayment = Buffer.from(xPaymentHeader, 'base64').toString('utf-8');

		// Parse the decoded value into a JSON object
		const decodedXPaymentJson = JSON.parse(decodedXPayment) as IPaymentPayload;

		const validation = validateXPayment(decodedXPaymentJson);
		if (validation != 'valid') {
			return generateX402Error(resp, 'x-payment header is not valid', paymentRequirements);
		}

		const verification = verifyPaymentDetails(decodedXPaymentJson, paymentRequirements);
		if (!verification.valid) {
			return generateX402Error(
				resp,
				`x-payment header is not valid for reasons: ${verification.errors}`,
				paymentRequirements,
			);
		}

		// Looks like everything is valid, now we'll verify the payment via 1Shot API.
		// We need to get the actual payment config- there's only one per network.
		// Problem with the x402 spec is that they don't send the actual token address.
		// So we need to find the config that matches the network, there should be only 1,
		// and we use that.

		const verifyResponse = await verifyX402Payment(
			this,
			decodedXPaymentJson.x402Version,
			decodedXPaymentJson,
			verification.paymentRequirements!,
		);

		if (!verifyResponse.isValid) {
			return generateX402Error(
				resp,
				`x-payment verification failed: ${verifyResponse.invalidReason}`,
				paymentRequirements,
			);
		}

		// If the verification is valid, we are going to be a little optimistic about the settlement. Since this can take a while, if the method errors,
		// (such as from a Cloudflare 502), we'll move on and assume it's successful.

		try {
			// Payment is verified, now we need to settle it!
			const settleResponse = await settleX402Payment(
				this,
				decodedXPaymentJson.x402Version,
				decodedXPaymentJson,
				verification.paymentRequirements!,
			);

			if (!settleResponse.success) {
				return generateX402Error(
					resp,
					`x-payment settlement failed: ${settleResponse.error}`,
					paymentRequirements,
				);
			}

			// Payment is settled, now we need to return the workflow data
			return generateResponse(
				this,
				req,
				responseMode,
				responseData,
				settleResponse.txHash,
				paymentRequirements,
				decodedXPaymentJson,
				prepareOutput,
			);
		} catch (error) {
			this.logger.error('Error in x402 webhook settlement, moving on...', error);
			return generateResponse(
				this,
				req,
				responseMode,
				responseData,
				'TBD',
				paymentRequirements,
				decodedXPaymentJson,
				prepareOutput,
			);
		}
	} catch (error) {
		this.logger.error('Error in x402 webhook', error);
		// Return an error object if the token format is invalid
		return generateX402Error(
			resp,
			`No x-payment header provided: ${error.message}`,
			paymentRequirements,
		);
	}
}

function generateResponse(
	context: IWebhookFunctions,
	req: express.Request,
	responseMode: string,
	responseData: string,
	txHash: string,
	paymentRequirements: IPaymentRequirements[],
	paymentPayload: IPaymentPayload,
	prepareOutput: (data: INodeExecutionData) => INodeExecutionData[][],
) {
	const response: INodeExecutionData = {
		json: {
			headers: req.headers,
			params: req.params,
			query: req.query,
			body: req.body,
			txHash: txHash,
			paymentRequirements: paymentRequirements,
			paymentPayload: paymentPayload,
		},
	};
	if (responseMode === 'streaming') {
		const res = context.getResponseObject();

		// Set up streaming response headers
		res.writeHead(200, {
			'Content-Type': 'application/json; charset=utf-8',
			'Transfer-Encoding': 'chunked',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
		});

		// Flush headers immediately
		res.flushHeaders();

		return {
			noWebhookResponse: true,
			workflowData: prepareOutput(response),
		};
	}

	return {
		webhookResponse: responseData,
		workflowData: prepareOutput(response),
	};
}

function generateX402Error(
	resp: express.Response,
	errorMessage: string,
	paymentRequirements: IPaymentRequirements[],
): IWebhookResponseData {
	resp.writeHead(402, { 'Content-Type': 'application/json' });
	resp.end(
		JSON.stringify({
			x402Version: 1,
			error: errorMessage,
			accepts: paymentRequirements,
		} as IX402ErrorResponse),
	);
	return { noWebhookResponse: true };
}

// ED-25519 signature verification
async function verify1ShotSignature(
	publicKey: string,
	signature: string,
	payload: any,
): Promise<boolean> {
	try {
		// Convert the public key from base64 to bytes
		const publicKeyBytes = Buffer.from(publicKey, 'base64');

		// Convert the signature from base64 to bytes
		const signatureBytes = Buffer.from(signature, 'base64');

		// Sort all object keys recursively and create a canonical JSON string
		const sortedData = sortObjectKeys(payload);
		const message = JSON.stringify(sortedData);

		// Convert the message to UTF-8 bytes
		const messageBytes = new TextEncoder().encode(message);

		// Verify the signature
		return await verifyAsync(signatureBytes, messageBytes, publicKeyBytes);
	} catch (error) {
		// If any error occurs during validation, return false
		return false;
	}
}

/**
 * Recursively sorts object keys alphabetically
 * @param obj - The object to sort
 * @returns A new object with sorted keys
 */
function sortObjectKeys(obj: Record<string, any>): Record<string, any> {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map(sortObjectKeys);
	}

	return Object.keys(obj)
		.sort()
		.reduce((result: Record<string, any>, key: string) => {
			result[key] = sortObjectKeys(obj[key]);
			return result;
		}, {});
}

// this will make sure our x-payment header contains all necessary components
function validateXPayment(payment: IPaymentPayload): string {
	// Define the expected structure and types
	const requiredShape = {
		x402Version: 'number',
		scheme: 'string',
		network: 'string',
		payload: {
			authorization: {
				from: 'string',
				to: 'string',
				value: 'string',
				validAfter: 'string',
				validBefore: 'string',
				nonce: 'string',
			},
			signature: 'string',
		},
	};

	const missing = checkShape(requiredShape, payment, '');

	if (missing.length > 0) {
		return missing.join('; ');
	}
	return 'valid';
}

function checkShape(
	expected: Record<string, any>,
	actual: Record<string, any>,
	path: string,
): string[] {
	const missing = new Array<string>();
	for (const key in expected) {
		const currentPath = path ? path + '.' + key : key;

		if (!(key in actual)) {
			missing.push('Missing field: ' + currentPath);
		} else if (typeof expected[key] === 'object') {
			if (typeof actual[key] !== 'object' || actual[key] === null) {
				missing.push('Invalid type at ' + currentPath + ': expected object');
			} else {
				checkShape(expected[key], actual[key], currentPath);
			}
		} else {
			if (typeof actual[key] !== expected[key]) {
				missing.push(
					'Invalid type at ' +
						currentPath +
						': expected ' +
						expected[key] +
						', got ' +
						typeof actual[key],
				);
			}
		}
	}
	return missing;
}

// this function will ensure the x-payment header is for one of our supported
// networks, is for the correct amount, and pays the right address
function verifyPaymentDetails(
	header: IPaymentPayload,
	paymentRequirements: PaymentRequirements[],
): { valid: boolean; errors: string; paymentRequirements: PaymentRequirements | undefined } {
	const errors = [];

	// 1. Check that network exists in config
	const network = header.network;
	const configEntry = paymentRequirements.find(
		(pc) => pc.network.toLowerCase() == (network || '').toLowerCase(),
	);

	if (configEntry == null) {
		errors.push('Invalid or unsupported network: ' + network);
	}

	// 2. Check value >= maxAmountRequired
	if (configEntry) {
		try {
			const required = BigInt(configEntry.maxAmountRequired);
			let actual;

			actual = BigInt(header.payload.authorization.value);
			if (typeof actual !== 'undefined' && actual < required) {
				errors.push(`Value too low: got ${actual}, requires at least ${required}`);
			}
		} catch (e) {
			errors.push('Invalid value: must be numeric string');
		}

		// 3. Check 'to' matches payTo (case-insensitive)
		const toAddr = header.payload?.authorization?.to;
		if (toAddr == null) {
			errors.push("Missing 'to' field in authorization");
		} else if (toAddr.toLowerCase() != configEntry.payTo.toLowerCase()) {
			errors.push(`Invalid 'to' address: expected ${configEntry.payTo}, got ${toAddr}`);
		}

		// 4. Check the validBefore and validAfer timestamps.
		const now = Math.floor(Date.now() / 1000);
		try {
			const validAfter = Number(header.payload.authorization.validAfter);
			const validBefore = Number(header.payload.authorization.validBefore);

			if (validAfter > now) {
				errors.push(
					`Payment has not activated, validAfter is ${validAfter} but the server time is ${now}`,
				);
			}
			if (validBefore < now) {
				errors.push(
					`Payment has expired, validBefore is ${validBefore} but the server time is ${now}`,
				);
			}
		} catch (e) {
			errors.push(`Invalid validAfter or validBefore timestamps`);
		}
	}

	return {
		valid: errors.length == 0,
		errors: errors.join('; '),
		paymentRequirements: configEntry,
	};
}

async function registerWebhookWithX402Scan(context: IWebhookFunctions, webhookUrl: string) {
	context.logger.info(`Registering webhook with X402Scan: ${webhookUrl}`);
	const response = await context.helpers.request.call(context, {
		method: 'POST',
		url: 'https://www.x402scan.com/api/trpc/public.resources.register',
		body: {
			'0': {
				json: {
					url: webhookUrl,
					headers: {},
				},
			},
		},
		qs: {
			batch: 1,
		},
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		json: true,
		timeout: 15000, // 15 seconds timeout
	});
	context.logger.debug('X402Scan registration response', response);
}

class PaymentRequirements implements IPaymentRequirements {
	public constructor(
		public scheme: string,
		public network: string,
		public maxAmountRequired: string,
		public resource: string,
		public description: string,
		public mimeType: string,
		public outputSchema: Record<string, unknown> | undefined,
		public payTo: string,
		public maxTimeoutSeconds: number,
		public asset: string,
		public extra: {
			name: string;
			version: string;
		},
	) {}
}

// async function validateAuth(context: IWebhookFunctions) {
// 	return await validateWebhookAuthentication(context, this.authPropertyName);
// }

// async function handleFormData(
// 	context: IWebhookFunctions,
// 	prepareOutput: (data: INodeExecutionData) => INodeExecutionData[][],
// ) {
// 	const req = context.getRequestObject() as MultiPartFormData.Request;
// 	const options = context.getNodeParameter('options', {}) as IDataObject;
// 	const { data, files } = req.body;

// 	const returnItem: INodeExecutionData = {
// 		json: {
// 			headers: req.headers,
// 			params: req.params,
// 			query: req.query,
// 			body: data,
// 		},
// 	};

// 	if (files && Object.keys(files).length) {
// 		returnItem.binary = {};
// 	}

// 	let count = 0;

// 	for (const key of Object.keys(files)) {
// 		const processFiles: MultiPartFormData.File[] = [];
// 		let multiFile = false;
// 		if (Array.isArray(files[key])) {
// 			processFiles.push(...files[key]);
// 			multiFile = true;
// 		} else {
// 			processFiles.push(files[key]);
// 		}

// 		let fileCount = 0;
// 		for (const file of processFiles) {
// 			let binaryPropertyName = key;
// 			if (binaryPropertyName.endsWith('[]')) {
// 				binaryPropertyName = binaryPropertyName.slice(0, -2);
// 			}
// 			if (multiFile) {
// 				binaryPropertyName += fileCount++;
// 			}
// 			if (options.binaryPropertyName) {
// 				binaryPropertyName = `${options.binaryPropertyName}${count}`;
// 			}

// 			returnItem.binary![binaryPropertyName] = await context.nodeHelpers.copyBinaryFile(
// 				file.filepath,
// 				file.originalFilename ?? file.newFilename,
// 				file.mimetype,
// 			);

// 			// Delete original file to prevent tmp directory from growing too large
// 			await rm(file.filepath, { force: true });

// 			count += 1;
// 		}
// 	}

// 	return { workflowData: prepareOutput(returnItem) };
// }

// async function handleBinaryData(
// 	context: IWebhookFunctions,
// 	prepareOutput: (data: INodeExecutionData) => INodeExecutionData[][],
// ): Promise<IWebhookResponseData> {
// 	const req = context.getRequestObject();
// 	const options = context.getNodeParameter('options', {}) as IDataObject;

// 	// TODO: create empty binaryData placeholder, stream into that path, and then finalize the binaryData
// 	const binaryFile = await tmpFile({ prefix: 'n8n-webhook-' });

// 	try {
// 		await pipeline(req, createWriteStream(binaryFile.path));

// 		const returnItem: INodeExecutionData = {
// 			json: {
// 				headers: req.headers,
// 				params: req.params,
// 				query: req.query,
// 				body: {},
// 			},
// 		};

// 		const stats = await stat(binaryFile.path);
// 		if (stats.size) {
// 			const binaryPropertyName = (options.binaryPropertyName ?? 'data') as string;
// 			const fileName = req.contentDisposition?.filename ?? uuid();
// 			const binaryData = await context.nodeHelpers.copyBinaryFile(
// 				binaryFile.path,
// 				fileName,
// 				req.contentType ?? 'application/octet-stream',
// 			);
// 			returnItem.binary = { [binaryPropertyName]: binaryData };
// 		}

// 		return { workflowData: prepareOutput(returnItem) };
// 	} catch (error) {
// 		throw new NodeOperationError(context.getNode(), error as Error);
// 	} finally {
// 		await binaryFile.cleanup();
// 	}
// }
