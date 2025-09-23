import { IExecuteFunctions, ILoadOptionsFunctions, NodeOperationError, sleep } from 'n8n-workflow';
import {
	EChain,
	PagedResponse,
	ContractMethod,
	ContractMethodTestResult,
	ContractMethodEstimate,
	Transaction,
	JSONValue,
	ERC7702Authorization,
	EncodeContractMethodResult,
} from '../types/1shot';
import { additionalCredentialOptions, oneshotApiBaseUrl } from '../types/constants';
import { getTransaction } from './Transactions';

export async function listContractMethodsOperation(context: IExecuteFunctions, index: number) {
	const chainId = context.getNodeParameter('chainId', index) as string;
	const page = context.getNodeParameter('page', index) as number;
	const pageSize = context.getNodeParameter('pageSize', index) as number;
	const name = context.getNodeParameter('name', index) as string;
	const contractAddress = context.getNodeParameter('contractAddress', index) as string;
	const promptId = context.getNodeParameter('promptId', index) as string;
	const methodType = context.getNodeParameter('methodType', index) as 'read' | 'write';

	return await listContractMethods(
		context,
		chainId == "all" ? undefined : Number(chainId) as EChain,
		page || undefined,
		pageSize || undefined,
		name || undefined,
		undefined, // status
		contractAddress || undefined,
		promptId || undefined,
		methodType || undefined,
	);
}

export async function getContractMethodOperation(context: IExecuteFunctions, index: number) {
	const contractMethodId = context.getNodeParameter('contractMethodId', index) as string;
	return await getContractMethod(context, contractMethodId);
}

export async function estimateContractMethodOperation(context: IExecuteFunctions, index: number) {
	const contractMethodId = context.getNodeParameter('contractMethodId', index) as string;
	const paramsString = context.getNodeParameter('params', index) as string;
	const parsedParams = JSON.parse(paramsString);

	return await estimateContractMethod(context, contractMethodId, parsedParams);
}

export async function simulateContractMethodOperation(context: IExecuteFunctions, index: number) {
	const contractMethodId = context.getNodeParameter('contractMethodId', index) as string;
	const paramsString = context.getNodeParameter('params', index) as string;
	const parsedParams = JSON.parse(paramsString);
	const gasLimit = context.getNodeParameter('gasLimit', index) as string | undefined;

	return await simulateContractMethod(context, contractMethodId, parsedParams, gasLimit);
}

export async function assureContractMethodsFromPromptOperation(
	context: IExecuteFunctions,
	index: number,
) {
	const chainId = context.getNodeParameter('chainId', index) as EChain;
	const contractAddress = context.getNodeParameter('contractAddress', index) as string;
	const walletId = context.getNodeParameter('walletId', index) as string;
	const promptId = context.getNodeParameter('promptId', index) as string;

	return await assureContractMethodsFromPrompt(
		context,
		chainId,
		contractAddress,
		walletId,
		promptId || undefined,
	);
}

export async function executeContractMethodOperation(context: IExecuteFunctions, index: number) {
	const contractMethodId = context.getNodeParameter('contractMethodId', index) as string;
	const paramsString = context.getNodeParameter('params', index) as string;
	const parsedParams = JSON.parse(paramsString);

	const additionalFields = context.getNodeParameter('additionalFields', index) as {
		memo?: string;
		walletId?: string;
		authorizationList?: string;
		value?: string;
		gasLimit?: string;
	};
	const memo = additionalFields.memo;
	const walletId = additionalFields.walletId;
	const value = additionalFields.value;
	const gasLimit = additionalFields.gasLimit;
	// const authorizationList = this.getNodeParameter('authorizationList', i) as string;
	// const parsedAuthorizationList = authorizationList != "" ? JSON.parse(authorizationList) : undefined;

	return await executeContractMethod(
		context,
		contractMethodId,
		parsedParams,
		walletId,
		memo,
		undefined,
		value,
		gasLimit,
	);
}

export async function executeAsDelegatorContractMethodOperation(
	context: IExecuteFunctions,
	index: number,
) {
	const contractMethodId = context.getNodeParameter('contractMethodId', index) as string;
	const paramsString = context.getNodeParameter('params', index) as string;
	const delegatorAddress = context.getNodeParameter('delegatorWalletAddress', index) as string;
	const parsedParams = JSON.parse(paramsString);

	const additionalFields = context.getNodeParameter('additionalFields', index) as {
		memo?: string;
		walletId?: string;
		value?: string;
		gasLimit?: string;
	};
	const memo = additionalFields.memo;
	const walletId = additionalFields.walletId;
	const value = additionalFields.value;
	const gasLimit = additionalFields.gasLimit;
	// const authorizationList = this.getNodeParameter('authorizationList', i) as string;
	// const parsedAuthorizationList = authorizationList != "" ? JSON.parse(authorizationList) : undefined;

	return await executeContractMethodAsDelegator(
		context,
		contractMethodId,
		parsedParams,
		delegatorAddress,
		walletId,
		memo,
		value,
		gasLimit,
	);
}

export async function executeAndWaitContractMethodOperation(
	context: IExecuteFunctions,
	index: number,
): Promise<{ success: boolean; result: Transaction }> {
	const contractMethodId = context.getNodeParameter('contractMethodId', index) as string;
	const paramsString = context.getNodeParameter('params', index) as string;
	const parsedParams = JSON.parse(paramsString);

	const additionalFields = context.getNodeParameter('additionalFields', index) as {
		memo?: string;
		walletId?: string;
		authorizationList?: string;
		value?: string;
		gasLimit?: string;
	};

	const memo = additionalFields.memo;
	const walletId = additionalFields.walletId;
	const value = additionalFields.value;
	const gasLimit = additionalFields.gasLimit;

	let transaction = await executeContractMethod(
		context,
		contractMethodId,
		parsedParams,
		walletId,
		memo,
		undefined,
		value,
		gasLimit,
	);

	// Wait for transaction to complete
	let status = 'Pending';
	let attempts = 0;
	while (status != 'Completed' && status != 'Failed' && attempts < 20) {
		await sleep(2000); // Wait 2 seconds between checks
		transaction = await getTransaction(context, transaction.id);
		status = transaction.status;
		attempts++;
	}

	if (status === 'Failed') {
		return { success: false, result: transaction };
	}

	return { success: true, result: transaction };
}

export async function executeAsDelegatorAndWaitContractMethodOperation(
	context: IExecuteFunctions,
	index: number,
): Promise<{ success: boolean; result: Transaction }> {
	const contractMethodId = context.getNodeParameter('contractMethodId', index) as string;
	const paramsString = context.getNodeParameter('params', index) as string;
	const delegatorAddress = context.getNodeParameter('delegatorWalletAddress', index) as string;
	const parsedParams = JSON.parse(paramsString);

	const additionalFields = context.getNodeParameter('additionalFields', index) as {
		memo?: string;
		walletId?: string;
		value?: string;
		gasLimit?: string;
	};
	const memo = additionalFields.memo;
	const walletId = additionalFields.walletId;
	const value = additionalFields.value;
	const gasLimit = additionalFields.gasLimit;

	let transaction = await executeContractMethodAsDelegator(
		context,
		contractMethodId,
		parsedParams,
		delegatorAddress,
		walletId,
		memo,
		value,
		gasLimit,
	);

	// Wait for transaction to complete
	let status = 'Pending';
	while (status != 'Completed' && status != 'Failed') {
		await sleep(2000); // Wait 2 seconds between checks
		transaction = await getTransaction(context, transaction.id);
		status = transaction.status;
	}

	if (status === 'Failed') {
		return { success: false, result: transaction };
	}

	return { success: true, result: transaction };
}

export async function encodeContractMethodOperation(context: IExecuteFunctions, index: number) {
	const contractMethodId = context.getNodeParameter('contractMethodId', index) as string;
	const paramsString = context.getNodeParameter('params', index) as string;
	const parsedParams = JSON.parse(paramsString);

	const additionalFields = context.getNodeParameter('additionalFields', index) as {
		authorizationList?: string;
		value?: string;
	};
	const value = additionalFields.value;
	// const authorizationList = this.getNodeParameter('authorizationList', i) as string;
	// const parsedAuthorizationList = authorizationList != "" ? JSON.parse(authorizationList) : undefined;

	return await encodeContractMethod(context, contractMethodId, parsedParams, value);
}

export async function readContractMethodOperation(context: IExecuteFunctions, index: number) {
	const contractMethodId = context.getNodeParameter('contractMethodId', index) as string;
	const paramsString = context.getNodeParameter('params', index) as string;
	const parsedParams = JSON.parse(paramsString);

	return await readContractMethod(context, contractMethodId, parsedParams);
}

export async function executeBatchOperation(context: IExecuteFunctions, index: number) {
	const contractMethodsData = context.getNodeParameter('contractMethods', index) as any;
	const walletId = context.getNodeParameter('walletId', index) as string;
	const additionalFields = context.getNodeParameter('additionalFields', index) as {
		atomic?: boolean;
		memo?: string;
		authorizationList?: string;
		gasLimit?: string;
	};

	// Transform the contract methods data to match the API format
	const contractMethods = contractMethodsData.contractMethod.map((method: any, methodIndex: number) => {
		const parsedParams = JSON.parse(method.params);
		const optionalFields = method.optionalFields || {};

		return {
			contractMethodId: method.contractMethodId,
			executionIndex: methodIndex,
			params: parsedParams,
			contractAddress: optionalFields.contractAddress || undefined,
			value: optionalFields.value || undefined,
		};
	});

	// Parse authorization list if provided
	let authorizationList;
	if (additionalFields.authorizationList) {
		authorizationList = JSON.parse(additionalFields.authorizationList);
	}

	return await executeBatch(
		context,
		contractMethods,
		walletId,
		additionalFields.atomic,
		additionalFields.memo,
		authorizationList,
		additionalFields.gasLimit,
	);
}

export async function executeAsDelegatorBatchOperation(context: IExecuteFunctions, index: number) {
	const contractMethodsData = context.getNodeParameter('contractMethods', index) as any;
	const walletId = context.getNodeParameter('walletId', index) as string;
	const additionalFields = context.getNodeParameter('additionalFields', index) as {
		atomic?: boolean;
		memo?: string;
		authorizationList?: string;
		gasLimit?: string;
	};

	// Transform the contract methods data to match the API format
	const contractMethods = contractMethodsData.contractMethod.map((method: any, methodIndex: number) => {
		const parsedParams = JSON.parse(method.params);
		const optionalFields = method.optionalFields || {};

		return {
			contractMethodId: method.contractMethodId,
			executionIndex: methodIndex,
			params: parsedParams,
			delegatorAddress: method.delegatorAddress,
			contractAddress: optionalFields.contractAddress || undefined,
			value: optionalFields.value || undefined,
		};
	});

	// Parse authorization list if provided
	let authorizationList;
	if (additionalFields.authorizationList) {
		authorizationList = JSON.parse(additionalFields.authorizationList);
	}

	return await executeAsDelegatorBatch(
		context,
		contractMethods,
		walletId,
		additionalFields.atomic,
		additionalFields.memo,
		authorizationList,
		additionalFields.gasLimit,
	);
}

export async function listContractMethods(
	context: ILoadOptionsFunctions | IExecuteFunctions,
	chainId?: EChain,
	page?: number,
	pageSize?: number,
	name?: string,
	status?: 'live' | 'archived' | 'both',
	contractAddress?: string,
	promptId?: string,
	methodType?: 'read' | 'write',
): Promise<PagedResponse<ContractMethod>> {
	try {
		const credentials = await context.getCredentials('oneShotOAuth2Api');
		const businessId = credentials.businessId as string;

		if (!businessId) {
			throw new NodeOperationError(context.getNode(), 'Business ID is required in credentials');
		}

		const response: PagedResponse<ContractMethod> =
			await context.helpers.requestWithAuthentication.call(
				context,
				'oneShotOAuth2Api',
				{
					method: 'GET',
					url: `/business/${businessId}/methods`,
					qs: {
						pageSize: pageSize ?? 25,
						page: page ?? 1,
						chainId,
						name,
						status,
						contractAddress,
						promptId,
						methodType,
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
		context.logger.error(`Error listing Contract Methods ${error.message}`, { error });
	}

	return new PagedResponse([], 1, 1, 0);
}

export async function createContractMethod(
	context: IExecuteFunctions,
	chainId: EChain,
	contractAddress: string,
	walletId: string,
	name: string,
	description: string,
	functionName: string,
	stateMutability: 'nonpayable' | 'payable' | 'view' | 'pure',
	inputs: any[],
	outputs: any[],
	callbackUrl?: string,
): Promise<ContractMethod> {
	try {
		const credentials = await context.getCredentials('oneShotOAuth2Api');
		const businessId = credentials.businessId as string;

		if (!businessId) {
			throw new NodeOperationError(context.getNode(), 'Business ID is required in credentials');
		}

		const response: ContractMethod = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: `/business/${businessId}/methods`,
				body: {
					chainId,
					contractAddress,
					walletId,
					name,
					description,
					functionName,
					stateMutability,
					inputs,
					outputs,
					callbackUrl,
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
		context.logger.error(`Error creating Contract Method ${error.message}`, { error });
		throw error;
	}
}

export async function createContractMethodsFromAbi(
	context: IExecuteFunctions,
	chainId: EChain,
	contractAddress: string,
	walletId: string,
	abi: any[],
	name?: string,
	description?: string,
	tags?: string[],
): Promise<ContractMethod[]> {
	try {
		const credentials = await context.getCredentials('oneShotOAuth2Api');
		const businessId = credentials.businessId as string;

		if (!businessId) {
			throw new NodeOperationError(context.getNode(), 'Business ID is required in credentials');
		}

		const response: ContractMethod[] = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: `/business/${businessId}/methods/abi`,
				body: {
					chainId,
					contractAddress,
					walletId,
					abi,
					name,
					description,
					tags,
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
		context.logger.error(`Error creating Contract Methods from ABI ${error.message}`, { error });
		throw error;
	}
}

export async function assureContractMethodsFromPrompt(
	context: IExecuteFunctions,
	chainId: EChain,
	contractAddress: string,
	walletId: string,
	promptId?: string,
): Promise<ContractMethod[]> {
	try {
		const credentials = await context.getCredentials('oneShotOAuth2Api');
		const businessId = credentials.businessId as string;

		if (!businessId) {
			throw new NodeOperationError(context.getNode(), 'Business ID is required in credentials');
		}

		const response: ContractMethod[] = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: `/business/${businessId}/methods/prompt`,
				body: {
					chainId,
					contractAddress,
					walletId,
					promptId,
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
		context.logger.error(`Error assuring Contract Methods from Prompt ${error.message}`, { error });
		throw error;
	}
}

export async function getContractMethod(
	context: IExecuteFunctions | ILoadOptionsFunctions,
	contractMethodId: string,
): Promise<ContractMethod> {
	try {
		const response: ContractMethod = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'GET',
				url: `/methods/${contractMethodId}`,
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
		context.logger.error(`Error getting Contract Method ${error.message}`, { error });
		throw error;
	}
}

export async function updateContractMethod(
	context: IExecuteFunctions,
	contractMethodId: string,
	chainId?: EChain,
	contractAddress?: string,
	walletId?: string,
	name?: string,
	description?: string,
	functionName?: string,
	payable?: boolean,
	nativeTransaction?: boolean,
	callbackUrl?: string | null,
): Promise<ContractMethod> {
	try {
		const response: ContractMethod = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'PUT',
				url: `/methods/${contractMethodId}`,
				body: {
					chainId,
					contractAddress,
					walletId,
					name,
					description,
					functionName,
					payable,
					nativeTransaction,
					callbackUrl,
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
		context.logger.error(`Error updating Contract Method ${error.message}`, { error });
		throw error;
	}
}

export async function deleteContractMethod(
	context: IExecuteFunctions,
	contractMethodId: string,
): Promise<void> {
	try {
		await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'DELETE',
				url: `/methods/${contractMethodId}`,
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
		context.logger.error(`Error deleting Contract Method ${error.message}`, { error });
		throw error;
	}
}

export async function simulateContractMethod(
	context: IExecuteFunctions,
	contractMethodId: string,
	params: JSONValue,
	gasLimit?: string,
): Promise<ContractMethodTestResult> {
	try {
		const response: ContractMethodTestResult = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: `/methods/${contractMethodId}/test`,
				body: {
					params,
					gasLimit,
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
		context.logger.error(`Error testing Contract Method ${error.message}`, { error });
		throw error;
	}
}

export async function estimateContractMethod(
	context: IExecuteFunctions,
	contractMethodId: string,
	params: JSONValue,
): Promise<ContractMethodEstimate> {
	try {
		const response: ContractMethodEstimate = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: `/methods/${contractMethodId}/estimate`,
				body: {
					params,
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
		context.logger.error(`Error estimating Contract Method ${error.message}`, { error });
		throw error;
	}
}

export async function executeContractMethod(
	context: IExecuteFunctions,
	contractMethodId: string,
	params: JSONValue,
	walletId?: string,
	memo?: string,
	authorizationList?: ERC7702Authorization[],
	value?: string,
	gasLimit?: string,
): Promise<Transaction> {
	try {
		const response: Transaction = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: `/methods/${contractMethodId}/execute`,
				body: {
					params,
					walletId,
					memo,
					authorizationList,
					value,
					gasLimit,
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
		context.logger.error(`Error executing Contract Method ${error.message}`, { error });
		throw error;
	}
}

export async function executeContractMethodAsDelegator(
	context: IExecuteFunctions,
	contractMethodId: string,
	params: JSONValue,
	delegatorAddress: string,
	walletId?: string,
	memo?: string,
	value?: string,
	gasLimit?: string,
): Promise<Transaction> {
	try {
		const response: Transaction = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: `/methods/${contractMethodId}/executeAsDelegator`,
				body: {
					params,
					delegatorAddress,
					walletId,
					memo,
					value,
					gasLimit,
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
		context.logger.error(`Error executing Contract Method ${error.message}`, { error });
		throw error;
	}
}

export async function encodeContractMethod(
	context: IExecuteFunctions,
	contractMethodId: string,
	params: JSONValue,
	value?: string,
): Promise<EncodeContractMethodResult> {
	try {
		const response: EncodeContractMethodResult =
			await context.helpers.requestWithAuthentication.call(
				context,
				'oneShotOAuth2Api',
				{
					method: 'POST',
					url: `/methods/${contractMethodId}/encode`,
					body: { params, value },
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
		context.logger.error(`Error encoding Contract Method ${error.message}`, { error });
		throw error;
	}
}

export async function readContractMethod(
	context: IExecuteFunctions,
	contractMethodId: string,
	params: JSONValue,
): Promise<JSONValue> {
	try {
		const response: JSONValue = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: `/methods/${contractMethodId}/read`,
				body: { params },
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
		context.logger.error(`Error reading Contract Method ${error.message}`, { error });
		throw error;
	}
}

export async function executeBatch(
	context: IExecuteFunctions,
	contractMethods: Array<{
		contractMethodId: string;
		executionIndex: number;
		params: JSONValue;
		value?: string;
		contractAddress?: string;
	}>,
	walletId: string,
	atomic?: boolean,
	memo?: string,
	authorizationList?: ERC7702Authorization[],
	gasLimit?: string,
): Promise<Transaction> {
	try {
		const response: Transaction = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: `/methods/executeBatch`,
				body: {
					contractMethods,
					walletId,
					atomic,
					memo,
					authorizationList,
					gasLimit,
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
		context.logger.error(`Error executing Contract Method batch ${error.message}`, { error });
		throw error;
	}
}

export async function executeAsDelegatorBatch(
	context: IExecuteFunctions,
	contractMethods: Array<{
		contractMethodId: string;
		executionIndex: number;
		params: JSONValue;
		delegatorAddress: string;
		value?: string;
		contractAddress?: string;
	}>,
	walletId: string,
	atomic?: boolean,
	memo?: string,
	authorizationList?: ERC7702Authorization[],
	gasLimit?: string,
): Promise<Transaction> {
	try {
		const response: Transaction = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: `/methods/executeAsDelegatorBatch`,
				body: {
					contractMethods,
					walletId,
					atomic,
					memo,
					authorizationList,
					gasLimit,
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
		context.logger.error(`Error executing Contract Method batch as delegator ${error.message}`, { error });
		throw error;
	}
}
