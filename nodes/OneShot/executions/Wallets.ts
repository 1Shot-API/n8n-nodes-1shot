import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	NodeOperationError,
} from 'n8n-workflow';
import { EChain, PagedResponse, Wallet } from '../types/1shot';
import { additionalCredentialOptions, oneshotApiBaseUrl } from '../types/constants';

export async function listWalletsOperation(context: IExecuteFunctions, index: number) {
	const chainId = context.getNodeParameter('chainId', index) as string;
	const page = context.getNodeParameter('page', index) as number;
	const pageSize = context.getNodeParameter('pageSize', index) as number;
	const name = context.getNodeParameter('name', index) as string;

	return await listWallets(
		context,
		chainId == 'all' ? undefined : (Number(chainId) as EChain),
		page || undefined,
		pageSize || undefined,
		name || undefined,
	);
}

export async function createWalletOperation(context: IExecuteFunctions, index: number) {
	const chainId = context.getNodeParameter('chainId', index) as EChain;
	const name = context.getNodeParameter('name', index) as string;
	const description = context.getNodeParameter('description', index) as string;

	return await createWallet(context, chainId, name, description || undefined);
}

export async function getWalletOperation(context: IExecuteFunctions, index: number) {
	const walletId = context.getNodeParameter('walletId', index) as string;

	return await getWallet(context, walletId, true);
}

export async function updateWalletOperation(context: IExecuteFunctions, index: number) {
	const walletId = context.getNodeParameter('walletId', index) as string;
	const name = context.getNodeParameter('name', index) as string;
	const description = context.getNodeParameter('description', index) as string;

	return await updateWallet(context, walletId, name || undefined, description || undefined);
}

export async function deleteWalletOperation(context: IExecuteFunctions, index: number) {
	const walletId = context.getNodeParameter('walletId', index) as string;
	return await deleteWallet(context, walletId);
}

export async function loadWalletOptions(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const response = await listWallets(this, undefined, 1, 1000, undefined);

	const options: INodePropertyOptions[] = [];
	for (const wallet of response.response) {
		options.push({
			name: wallet.name,
			value: wallet.id,
			description: wallet.description,
		});
	}

	return options;
}

export async function listWallets(
	context: ILoadOptionsFunctions | IExecuteFunctions,
	chainId?: EChain,
	page?: number,
	pageSize?: number,
	name?: string,
): Promise<PagedResponse<Wallet>> {
	try {
		// Get the credentials to access businessId
		const credentials = await context.getCredentials('oneShotOAuth2Api');
		const businessId = credentials.businessId as string;

		if (!businessId) {
			throw new NodeOperationError(context.getNode(), 'Business ID is required in credentials');
		}

		const response: PagedResponse<Wallet> = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'GET',
				url: `/business/${businessId}/wallets`,
				qs: {
					pageSize: pageSize ?? 25,
					page: page ?? 1,
					chainId: chainId ?? undefined,
					name: name ?? undefined,
				},
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
		context.logger.error(`Error loading wallets ${error.message}`, { error });
	}

	return new PagedResponse([], 1, 1, 0);
}

export async function createWallet(
	context: IExecuteFunctions,
	chainId: EChain,
	name: string,
	description?: string,
): Promise<Wallet> {
	try {
		const credentials = await context.getCredentials('oneShotOAuth2Api');
		const businessId = credentials.businessId as string;

		if (!businessId) {
			throw new NodeOperationError(context.getNode(), 'Business ID is required in credentials');
		}

		const response: Wallet = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: `/business/${businessId}/wallets`,
				body: {
					chainId,
					name,
					description,
				},
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
		context.logger.error(`Error creating wallet ${error.message}`, { error });
		throw error;
	}
}

export async function getWallet(
	context: IExecuteFunctions | ILoadOptionsFunctions,
	walletId: string,
	includeBalances?: boolean,
): Promise<Wallet> {
	try {
		const response: Wallet = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'GET',
				url: `/wallets/${walletId}`,
				qs: {
					includeBalances: includeBalances ?? false,
				},
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
		context.logger.error(`Error getting wallet ${error.message}`, { error });
		throw error;
	}
}

export async function updateWallet(
	context: IExecuteFunctions,
	walletId: string,
	name?: string,
	description?: string,
): Promise<Wallet> {
	try {
		const response: Wallet = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'PUT',
				url: `/wallets/${walletId}`,
				body: {
					name,
					description,
				},
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
		context.logger.error(`Error updating wallet ${error.message}`, { error });
		throw error;
	}
}

export async function deleteWallet(
	context: IExecuteFunctions,
	walletId: string,
): Promise<{ success: boolean }> {
	try {
		const response: { success: boolean } = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'DELETE',
				url: `/wallets/${walletId}`,
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
		context.logger.error(`Error deleting wallet ${error.message}`, { error });
		throw error;
	}
}

export async function getSignature(
	context: IExecuteFunctions | ILoadOptionsFunctions,
	walletId: string,
	type: 'erc3009' | 'permit2',
	contractAddress: string,
	destinationAddress: string,
	amount: string,
	validUntil: number,
	validAfter?: number,
): Promise<{ signature: string; data: string }> {
	try {
		const response: { signature: string; data: string } =
			await context.helpers.requestWithAuthentication.call(
				context,
				'oneShotOAuth2Api',
				{
					method: 'GET',
					url: `/wallets/${walletId}/signature/${type}`,
					qs: {
						contractAddress,
						destinationAddress,
						amount: amount,
						validUntil: validUntil,
						validAfter: validAfter ?? undefined,
					},
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
		context.logger.error(`Error getting signature ${error.message}`, { error });
		throw error;
	}
}
