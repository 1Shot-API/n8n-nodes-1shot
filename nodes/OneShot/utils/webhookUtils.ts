import type { IWebhookFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';

export type WebhookParameters = {
	httpMethod: string | string[];
	responseMode: string;
	responseData: string;
	responseCode?: number; //typeVersion <= 1.1
	responseHeaders?: Array<{
		name: string;
		value: string;
	}>;
	options?: {
		responseData?: string;
		responseCode?: {
			values?: {
				responseCode: number;
				customCode?: number;
			};
		};
		noResponseBody?: boolean;
		responseHeaders?: {
			entries?: Array<{
				name: string;
				value: string;
			}>;
		};
		x402RefundsContactEmail?: string;
	};
};

export const getResponseCode = (parameters: WebhookParameters) => {
	if (parameters.responseCode) {
		return parameters.responseCode;
	}
	const responseCodeOptions = parameters.options;
	if (responseCodeOptions?.responseCode?.values) {
		const { responseCode, customCode } = responseCodeOptions.responseCode.values;

		if (customCode) {
			return customCode;
		}

		return responseCode;
	}
	return 200;
};

export const getResponseData = (parameters: WebhookParameters) => {
	const { responseData, responseMode, options } = parameters;
	if (responseData) return responseData;

	if (responseMode === 'onReceived') {
		const data = options?.responseData;
		if (data) return data;
	}

	if (options?.noResponseBody) return 'noData';

	return undefined;
};

export const getResponseHeaders = (parameters: WebhookParameters) => {
	// This should never happen but we need to handle it.
	if (parameters.options == null) {
		return null;
	}

	// Get the response headers from the options.
	let responseHeaders = parameters.options.responseHeaders;

	try {
		const x402RefundsHeader = getX402RefundHeader(parameters.options.x402RefundsContactEmail);

		if (x402RefundsHeader == null) {
			return responseHeaders;
		}

		// We need to add a link header to the response headers.
		// Make sure we have the entries.
		if (responseHeaders == null) {
			responseHeaders = {
				entries: [],
			};
		}

		const entries = responseHeaders.entries!;

		const existingLinkIndex = entries.findIndex((entry) => entry.name?.toLowerCase() === 'link');
		if (existingLinkIndex >= 0) {
			const existing = entries[existingLinkIndex];
			existing.value = existing.value
				? `${existing.value}, ${x402RefundsHeader}`
				: x402RefundsHeader;

			return responseHeaders;
		}

		// No existing link header so we need to add it
		entries.push({
			name: 'Link',
			value: x402RefundsHeader,
		});
		return responseHeaders;
	} catch (e) {
		return responseHeaders;
	}
};

export function getX402RefundHeader(x402RefundsContactEmail?: string): string | null {
	if (x402RefundsContactEmail == null || x402RefundsContactEmail === '') {
		return null;
	}
	const refundContact = `<mailto:${x402RefundsContactEmail}>; rel="https://x402refunds.com/rel/refund-contact"`;
	const refundRequest =
		'<https://api.x402refunds.com/v1/refunds>; rel="https://x402refunds.com/rel/refund-request"; type="application/json"';

	return `${refundContact}, ${refundRequest}`;
}

export const configuredOutputs = (parameters: WebhookParameters) => {
	const httpMethod = parameters.httpMethod;

	if (!Array.isArray(httpMethod))
		return [
			{
				type: 'main',
				displayName: httpMethod,
			},
		];

	const outputs = httpMethod.map((method) => {
		return {
			type: 'main',
			displayName: method,
		};
	});

	return outputs;
};

export const setupOutputConnection = (
	ctx: IWebhookFunctions,
	method: string,
	additionalData: {
		jwtPayload?: IDataObject;
	},
) => {
	const httpMethod = ctx.getNodeParameter('httpMethod', []) as string[] | string;
	let webhookUrl = ctx.getNodeWebhookUrl('default') as string;
	const executionMode = ctx.getMode() === 'manual' ? 'test' : 'production';

	if (executionMode === 'test') {
		webhookUrl = webhookUrl.replace('/webhook/', '/webhook-test/');
	}

	// multi methods could be set in settings of node, so we need to check if it's an array
	if (!Array.isArray(httpMethod)) {
		return (outputData: INodeExecutionData): INodeExecutionData[][] => {
			outputData.json.webhookUrl = webhookUrl;
			outputData.json.executionMode = executionMode;
			if (additionalData?.jwtPayload) {
				outputData.json.jwtPayload = additionalData.jwtPayload;
			}
			return [[outputData]];
		};
	}

	const outputIndex = httpMethod.indexOf(method.toUpperCase());
	const outputs: INodeExecutionData[][] = httpMethod.map(() => []);

	return (outputData: INodeExecutionData): INodeExecutionData[][] => {
		outputData.json.webhookUrl = webhookUrl;
		outputData.json.executionMode = executionMode;
		if (additionalData?.jwtPayload) {
			outputData.json.jwtPayload = additionalData.jwtPayload;
		}
		outputs[outputIndex] = [outputData];
		return outputs;
	};
};

export const isIpWhitelisted = (
	whitelist: string | string[] | undefined,
	ips: string[],
	ip?: string,
) => {
	if (whitelist === undefined || whitelist === '') {
		return true;
	}

	if (!Array.isArray(whitelist)) {
		whitelist = whitelist.split(',').map((entry) => entry.trim());
	}

	for (const address of whitelist) {
		if (ip?.includes(address)) {
			return true;
		}

		if (ips.some((entry) => entry.includes(address))) {
			return true;
		}
	}

	return false;
};
