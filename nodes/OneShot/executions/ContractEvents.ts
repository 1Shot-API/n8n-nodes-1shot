import { IExecuteFunctions, ILoadOptionsFunctions, NodeOperationError } from 'n8n-workflow';
import {
	EChain,
	PagedResponse,
	ContractEvent,
	ContractEventLog,
} from '../types/1shot';
import { additionalCredentialOptions, oneshotApiBaseUrl } from '../types/constants';

export async function listContractEventsOperation(context: IExecuteFunctions, index: number) {
	const chainId = context.getNodeParameter('chainId', index) as string;
	const page = context.getNodeParameter('page', index) as number;
	const pageSize = context.getNodeParameter('pageSize', index) as number;
	const name = context.getNodeParameter('name', index) as string;
	const contractAddress = context.getNodeParameter('contractAddress', index) as string;
	const eventName = context.getNodeParameter('eventName', index) as string;

	return await listContractEvents(
		context,
		chainId == "all" ? undefined : Number(chainId) as EChain,
		page || undefined,
		pageSize || undefined,
		name || undefined,
		undefined, // status
		contractAddress || undefined,
		eventName || undefined,
	);
}

export async function getContractEventOperation(context: IExecuteFunctions, index: number) {
	const contractEventId = context.getNodeParameter('contractEventId', index) as string;
	return await getContractEvent(context, contractEventId);
}

export async function createContractEventOperation(context: IExecuteFunctions, index: number) {
	const chainId = context.getNodeParameter('chainId', index) as EChain;
	const contractAddress = context.getNodeParameter('contractAddress', index) as string;
	const name = context.getNodeParameter('name', index) as string;
	const description = context.getNodeParameter('description', index) as string;
	const eventName = context.getNodeParameter('eventName', index) as string;

	return await createContractEvent(
		context,
		chainId,
		contractAddress,
		name,
		description,
		eventName,
	);
}

export async function updateContractEventOperation(context: IExecuteFunctions, index: number) {
	const contractEventId = context.getNodeParameter('contractEventId', index) as string;
	const name = context.getNodeParameter('name', index) as string;
	const description = context.getNodeParameter('description', index) as string;

	return await updateContractEvent(context, contractEventId, name, description);
}

export async function deleteContractEventOperation(context: IExecuteFunctions, index: number) {
	const contractEventId = context.getNodeParameter('contractEventId', index) as string;
	return await deleteContractEvent(context, contractEventId);
}

export async function searchContractEventOperation(context: IExecuteFunctions, index: number) {
	const contractEventId = context.getNodeParameter('contractEventId', index) as string;
	const startBlock = context.getNodeParameter('startBlock', index) as number;
	const endBlock = context.getNodeParameter('endBlock', index) as number;
	const topics = context.getNodeParameter('topics', index) as any;

	return await searchContractEvent(context, contractEventId, startBlock, endBlock, topics);
}

export async function listContractEvents(
	context: ILoadOptionsFunctions | IExecuteFunctions,
	chainId?: EChain,
	page?: number,
	pageSize?: number,
	name?: string,
	status?: 'active' | 'deleted' | 'all',
	contractAddress?: string,
	eventName?: string,
): Promise<PagedResponse<ContractEvent>> {
	try {
		const credentials = await context.getCredentials('oneShotOAuth2Api');
		const businessId = credentials.businessId as string;

		if (!businessId) {
			throw new NodeOperationError(context.getNode(), 'Business ID is required in credentials');
		}

		const response: PagedResponse<ContractEvent> =
			await context.helpers.requestWithAuthentication.call(
				context,
				'oneShotOAuth2Api',
				{
					method: 'GET',
					url: `/business/${businessId}/events`,
					qs: {
						pageSize: pageSize ?? 25,
						page: page ?? 1,
						chainId,
						name,
						status,
						contractAddress,
						eventName,
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
		context.logger.error(`Error listing Contract Events ${error.message}`, { error });
	}

	return new PagedResponse([], 1, 1, 0);
}

export async function createContractEvent(
	context: IExecuteFunctions,
	chainId: EChain,
	contractAddress: string,
	name: string,
	description: string,
	eventName: string,
): Promise<ContractEvent> {
	try {
		const credentials = await context.getCredentials('oneShotOAuth2Api');
		const businessId = credentials.businessId as string;

		if (!businessId) {
			throw new NodeOperationError(context.getNode(), 'Business ID is required in credentials');
		}

		const response: ContractEvent = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: `/business/${businessId}/events`,
				body: {
					chainId,
					contractAddress,
					name,
					description,
					eventName,
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
		context.logger.error(`Error creating Contract Event ${error.message}`, { error });
		throw error;
	}
}

export async function getContractEvent(
	context: IExecuteFunctions | ILoadOptionsFunctions,
	contractEventId: string,
): Promise<ContractEvent> {
	try {
		const response: ContractEvent = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'GET',
				url: `/events/${contractEventId}`,
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
		context.logger.error(`Error getting Contract Event ${error.message}`, { error });
		throw error;
	}
}

export async function updateContractEvent(
	context: IExecuteFunctions,
	contractEventId: string,
	name?: string,
	description?: string,
): Promise<ContractEvent> {
	try {
		const response: ContractEvent = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'PUT',
				url: `/events/${contractEventId}`,
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
		context.logger.error(`Error updating Contract Event ${error.message}`, { error });
		throw error;
	}
}

export async function deleteContractEvent(
	context: IExecuteFunctions,
	contractEventId: string,
): Promise<void> {
	try {
		await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'DELETE',
				url: `/events/${contractEventId}`,
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				json: true,
				baseURL: oneshotApiBaseUrl,
			},
			additionalCredentialOptions,
		);
	} catch (error) {
		context.logger.error(`Error deleting Contract Event ${error.message}`, { error });
		throw error;
	}
}

export async function searchContractEvent(
	context: IExecuteFunctions,
	contractEventId: string,
	startBlock?: number,
	endBlock?: number,
	topics?: any,
): Promise<{ logs: ContractEventLog[]; error?: string; maxResults?: number; startBlock?: number; endBlock?: number }> {
	try {
		const response = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: `/events/${contractEventId}/search`,
				body: {
					startBlock,
					endBlock,
					topics,
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
		context.logger.error(`Error searching Contract Event ${error.message}`, { error });
		throw error;
	}
}
