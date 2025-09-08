import {
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	INodeProperties,
	IExecuteFunctions,
	NodeOperationError,
	IDataObject,
} from 'n8n-workflow';
import { contractMethodOperationsFields } from './descriptions/ContractMethodDescription';
import { walletOperationsFields } from './descriptions/WalletDescription';
import { promptOperationsFields } from './descriptions/PromptDescription';
import { transactionOperationsFields } from './descriptions/TransactionDescription';
import {
	loadChainOptions,
	loadChainOptionsWithAll,
	loadContractMethodAllOptions,
	loadContractMethodExecutionOptions,
	loadContractMethodReadOptions,
} from './executions/options';
import {
	createWalletOperation,
	deleteWalletOperation,
	getWalletOperation,
	listWalletsOperation,
	loadWalletOptions,
	updateWalletOperation,
} from './executions/Wallets';
import {
	assureContractMethodsFromPromptOperation,
	encodeContractMethodOperation,
	estimateContractMethodOperation,
	executeAsDelegatorContractMethodOperation,
	executeContractMethodOperation,
	getContractMethodOperation,
	listContractMethodsOperation,
	readContractMethodOperation,
	simulateContractMethodOperation,
} from './executions/ContractMethods';
import { oneshotApiBaseUrl } from './types/constants';
import { getTransactionOperation, listTransactionsOperation } from './executions/Transactions';
import { searchPromptsOperation } from './executions/Prompts';
import { chainOperationsFields } from './descriptions/ChainDescription';
import { listChainsOperation } from './executions/Chains';

export class OneShot implements INodeType {
	description: INodeTypeDescription = {
		displayName: '1Shot API',
		name: 'oneShot',
		icon: { light: 'file:oneshot.svg', dark: 'file:oneshot.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with EVM blockchains via 1Shot API',
		defaults: {
			name: '1Shot API',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'oneShotOAuth2Api',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: oneshotApiBaseUrl,
			url: '',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		/**
		 * In the properties array we have two mandatory options objects required
		 *
		 * [Resource & Operation]
		 *
		 * https://docs.n8n.io/integrations/creating-nodes/code/create-first-node/#resources-and-operations
		 *
		 * In our example, the operations are separated into their own file (TransactionDescription.ts)
		 * to keep this class easy to read.
		 *
		 */
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Chain',
						value: 'chains',
					},
					{
						name: 'Contract Method',
						value: 'contractMethods',
					},
					{
						name: 'Prompt',
						value: 'prompts',
					},
					// {
					// 	name: 'Struct',
					// 	value: 'structs',
					// },
					{
						name: 'Transaction',
						value: 'transactions',
					},
					{
						name: 'Wallet',
						value: 'wallets',
					},
				],
				default: 'contractMethods',
			} as INodeProperties,
			...chainOperationsFields,
			...contractMethodOperationsFields,
			...walletOperationsFields,
			...promptOperationsFields,
			// ...structOperationsFields,
			...transactionOperationsFields,
		],
	};

	methods = {
		loadOptions: {
			loadChainOptions,
			loadChainOptionsWithAll,
			loadContractMethodExecutionOptions,
			loadContractMethodReadOptions,
			loadContractMethodAllOptions,
			loadWalletOptions,
		},
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();
		const returnData = [];

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			if (resource === 'contractMethods') {
				if (operation === 'execute') {
					const response = await executeContractMethodOperation(this, i);
					returnData.push(response);
				} else if (operation === 'executeAsDelegator') {
					const response = await executeAsDelegatorContractMethodOperation(this, i);
					returnData.push(response);
				} else if (operation === 'encode') {
					const response = await encodeContractMethodOperation(this, i);
					returnData.push(response);
				} else if (operation === 'estimate') {
					const response = await estimateContractMethodOperation(this, i);
					returnData.push(response);
				} else if (operation === 'simulate') {
					const response = await simulateContractMethodOperation(this, i);
					returnData.push(response);
				} else if (operation === 'read') {
					const response = await readContractMethodOperation(this, i);
					returnData.push({ response: response });
				} else if (operation === 'list') {
					const response = await listContractMethodsOperation(this, i);
					returnData.push(...response.response);
				} else if (operation === 'get') {
					const response = await getContractMethodOperation(this, i);
					returnData.push(response);
				} else if (operation === 'assureContractMethodsFromPrompt') {
					const response = await assureContractMethodsFromPromptOperation(this, i);
					returnData.push(...response);
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`Unsupported operation for resource contractMethods: ${operation}`,
					);
				}
			} else if (resource === 'wallets') {
				if (operation === 'list') {
					const response = await listWalletsOperation(this, i);
					returnData.push(...response.response);
				} else if (operation === 'create') {
					const response = await createWalletOperation(this, i);
					returnData.push(response);
				} else if (operation === 'get') {
					const response = await getWalletOperation(this, i);
					returnData.push(response);
				} else if (operation === 'update') {
					const response = await updateWalletOperation(this, i);
					returnData.push(response);
				} else if (operation === 'delete') {
					const response = await deleteWalletOperation(this, i);
					returnData.push(response);
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`Unsupported operation for resource wallets: ${operation}`,
					);
				}
			} else if (resource === 'prompts') {
				if (operation === 'search') {
					const response = await searchPromptsOperation(this, i);
					returnData.push(...response);
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`Unsupported operation for resource prompts: ${operation}`,
					);
				}
			} else if (resource === 'transactions') {
				if (operation === 'list') {
					const response = await listTransactionsOperation(this, i);
					returnData.push(...response.response);
				} else if (operation === 'get') {
					const response = await getTransactionOperation(this, i);
					returnData.push(response);
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`Unsupported operation for resource transactions: ${operation}`,
					);
				}
			} else if (resource === 'chains') {
				if (operation === 'list') {
					const response = await listChainsOperation(this, i);
					returnData.push(...response.response);
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`Unsupported operation for resource chains: ${operation}`,
					);
				}
			} else {
				throw new NodeOperationError(this.getNode(), `Unsupported resource: ${resource}`);
			}
		}

		return [this.helpers.returnJsonArray(returnData as IDataObject[])];
	}
}
