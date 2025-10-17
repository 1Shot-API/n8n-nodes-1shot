import { IExecuteFunctions, ILoadOptionsFunctions, IWebhookFunctions } from 'n8n-workflow';
import {
	X402SupportedResponse,
	X402VerifyRequest,
	X402VerifyResponse,
	X402SettleRequest,
	X402SettleResponse,
	IPaymentRequirements,
	IPaymentPayload,
} from '../types/1shot';
import { additionalCredentialOptions, oneshotApiBaseUrl } from '../types/constants';

class X402SupportedCacheEntry {
	public constructor(
		public timestamp: number,
		public response: X402SupportedResponse,
	) {}
}

const x402SupportedCache = new Map<string, X402SupportedCacheEntry>();

export async function getX402Supported(
	context: IExecuteFunctions | ILoadOptionsFunctions | IWebhookFunctions,
): Promise<X402SupportedResponse> {
	try {
		const credentials = await context.getCredentials('oneShotOAuth2Api');

		// We are going to cache this response for a bit, based on the credentials
		const clientId = credentials.clientId as string;

		// Check the cache for a response
		const cachedEntry = x402SupportedCache.get(clientId);
		if (cachedEntry && cachedEntry.timestamp > Date.now() - 1000 * 60 * 5) {
			// 5 minutes
			return cachedEntry.response;
		}

		// No cache hit
		const response: X402SupportedResponse = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'GET',
				url: '/x402/supported',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				json: true,
				baseURL: oneshotApiBaseUrl,
			},
			additionalCredentialOptions,
		);

		// Cache the response
		x402SupportedCache.set(clientId, new X402SupportedCacheEntry(Date.now(), response));

		return response;
	} catch (error) {
		context.logger.error(`Error getting X402 supported methods ${error.message}`, { error });
		throw error;
	}
}

export async function verifyX402Payment(
	context: IWebhookFunctions,
	x402Version: number,
	paymentPayload: IPaymentPayload,
	paymentRequirements: IPaymentRequirements,
): Promise<X402VerifyResponse> {
	try {
		const requestBody: X402VerifyRequest = {
			x402Version,
			paymentPayload,
			paymentRequirements,
		};

		const response: X402VerifyResponse = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: '/x402/verify',
				body: requestBody,
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				json: true,
				baseURL: oneshotApiBaseUrl,
			},
			additionalCredentialOptions,
		);

		return response;
	} catch (error) {
		context.logger.error(`Error verifying X402 payment ${error.message}`, { error });
		throw error;
	}
}

export async function settleX402Payment(
	context: IWebhookFunctions,
	x402Version: number,
	paymentPayload: IPaymentPayload,
	paymentRequirements: IPaymentRequirements,
): Promise<X402SettleResponse> {
	try {
		const requestBody: X402SettleRequest = {
			x402Version,
			paymentPayload,
			paymentRequirements,
		};

		const response: X402SettleResponse = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: '/x402/settle',
				body: requestBody,
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				json: true,
				baseURL: oneshotApiBaseUrl,
				timeout: 0, // Do not timeout on this, otherwise the payment will settle but you won't get the response!
			},
			additionalCredentialOptions,
		);

		return response;
	} catch (error) {
		context.logger.error(`Error settling X402 payment ${error.message}`, { error });
		throw error;
	}
}
