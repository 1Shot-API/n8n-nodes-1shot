import {
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	IExecuteFunctions,
	IDataObject,
} from 'n8n-workflow';
import { oneshotApiBaseUrl } from './types/constants';
import {
	executeAndWaitContractMethodOperation,
	executeAsDelegatorAndWaitContractMethodOperation,
	executeBatchAndWaitOperation,
	executeAsDelegatorBatchAndWaitOperation,
} from './executions/ContractMethods';
import { loadContractMethodExecutionOptions } from './executions/options';
import { loadWalletOptions } from './executions/Wallets';

export class OneShotSynch implements INodeType {
	description: INodeTypeDescription = {
		displayName: '1Shot API Submit & Wait',
		name: 'oneShotSynch',
		icon: { light: 'file:oneshot.svg', dark: 'file:oneshot.svg' },
		group: ['transform'],
		version: 1,
		subtitle: 'Execute and wait for transaction completion',
		description: 'Execute a contract method and wait for the transaction to complete',
		defaults: {
			name: '1Shot API Submit & Wait',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main, NodeConnectionType.Main],
		outputNames: ['Success', 'Error'],
		usableAsTool: true,
		credentials: [
			{
				name: 'oneShotOAuth2Api',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: oneshotApiBaseUrl,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {},
				options: [
					{
						name: 'Execute',
						value: 'execute',
						description: 'Execute a contract method on the blockchain',
						action: 'Execute a contract method',
					},
					{
						name: 'Execute as Delegator',
						value: 'executeAsDelegator',
						description:
							'Execute a contract method on the blockchain using a stored ERC-7702 delegation',
						action: 'Execute a contract method as delegator',
					},
					{
						name: 'Execute Batch',
						value: 'executeBatch',
						description: 'Execute multiple smart contract methods in a single transaction',
						action: 'Execute multiple smart contract methods',
					},
					{
						name: 'Execute Batch as Delegator',
						value: 'executeAsDelegatorBatch',
						description:
							'Execute multiple smart contract methods as a delegator in a single transaction',
						action: 'Execute multiple smart contract methods as delegator',
					},
				],
				default: 'execute',
			},
			{
				displayName: 'Contract Method Name or ID',
				name: 'contractMethodId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'loadContractMethodExecutionOptions',
				},
				required: true,
				displayOptions: {
					show: {
						operation: ['execute', 'executeAsDelegator'],
					},
				},
				default: '',
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Parameters',
				name: 'params',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						operation: ['execute', 'executeAsDelegator'],
					},
				},
				default: '{}',
				description:
					'The parameters to pass to the Contract Method. Enter a JSON object (e.g., {"to": "0x3e6a2f0CBA03d293B54c9fCF354948903007a798", "amount": "10000"}).',
			},
			{
				displayName: 'Delegator Wallet Address',
				name: 'delegatorWalletAddress',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['executeAsDelegator'],
					},
				},
				default: '',
				description: 'The address of the delagator wallet to use for the contract method',
			},
			{
				displayName: 'Contract Methods',
				name: 'contractMethods',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				required: true,
				displayOptions: {
					show: {
						operation: ['executeBatch'],
					},
				},
				default: {},
				options: [
					{
						name: 'contractMethod',
						displayName: 'Contract Method',
						// eslint-disable-next-line n8n-nodes-base/node-param-fixed-collection-type-unsorted-items
						values: [
							{
								displayName: 'Contract Method Name or ID',
								name: 'contractMethodId',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'loadContractMethodExecutionOptions',
								},
								required: true,
								default: '',
								description:
									'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
							},
							{
								displayName: 'Parameters',
								name: 'params',
								type: 'json',
								required: true,
								default: '{}',
								description:
									'The parameters to pass to the Contract Method. Enter a JSON object (e.g., {"to": "0x3e6a2f0CBA03d293B54c9fCF354948903007a798", "amount": "10000"}).',
							},
							{
								displayName: 'Optional Fields',
								name: 'optionalFields',
								type: 'collection',
								placeholder: 'Add Field',
								default: {},
								options: [
									{
										displayName: 'Contract Address',
										name: 'contractAddress',
										type: 'string',
										default: '',
										description: 'The contract address for this method execution',
									},
									{
										displayName: 'Value',
										name: 'value',
										type: 'string',
										default: '',
										description:
											'The amount of native token to send along with the Contract Method',
									},
								],
							},
						],
					},
				],
			},
			{
				displayName: 'Contract Methods',
				name: 'contractMethods',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				required: true,
				displayOptions: {
					show: {
						operation: ['executeAsDelegatorBatch'],
					},
				},
				default: {},
				options: [
					{
						name: 'contractMethod',
						displayName: 'Contract Method',
						// eslint-disable-next-line n8n-nodes-base/node-param-fixed-collection-type-unsorted-items
						values: [
							{
								displayName: 'Contract Method Name or ID',
								name: 'contractMethodId',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'loadContractMethodExecutionOptions',
								},
								required: true,
								default: '',
								description:
									'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
							},
							{
								displayName: 'Parameters',
								name: 'params',
								type: 'json',
								required: true,
								default: '{}',
								description:
									'The parameters to pass to the Contract Method. Enter a JSON object (e.g., {"to": "0x3e6a2f0CBA03d293B54c9fCF354948903007a798", "amount": "10000"}).',
							},
							{
								displayName: 'Delegator Address',
								name: 'delegatorAddress',
								type: 'string',
								required: true,
								default: '',
								description:
									'The address of the delegator on whose behalf the transaction will be executed',
							},
							{
								displayName: 'Optional Fields',
								name: 'optionalFields',
								type: 'collection',
								placeholder: 'Add Field',
								default: {},
								options: [
									{
										displayName: 'Contract Address',
										name: 'contractAddress',
										type: 'string',
										default: '',
										description: 'The contract address for this method execution',
									},
									{
										displayName: 'Value',
										name: 'value',
										type: 'string',
										default: '',
										description:
											'The amount of native token to send along with the Contract Method',
									},
								],
							},
						],
					},
				],
			},
			{
				displayName: 'Wallet Name or ID',
				name: 'walletId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'loadWalletOptions',
				},
				required: true,
				displayOptions: {
					show: {
						operation: ['executeBatch', 'executeAsDelegatorBatch'],
					},
				},
				default: '',
				description:
					'Select the Wallet to use for the contract methods. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['execute', 'executeAsDelegator'],
					},
				},
				options: [
					{
						displayName: 'Wallet ID',
						name: 'walletId',
						type: 'string',
						default: '',
						description: 'The ID of the Wallet to use for this Contract Method',
					},
					{
						displayName: 'Memo',
						name: 'memo',
						type: 'string',
						default: '',
						description:
							'Optional text to include with the Transaction after the Contract Method is executed',
					},
					{
						displayName: 'Gas Limit',
						name: 'gasLimit',
						type: 'string',
						default: '',
						description:
							'The gas limit to use for the Contract Method. If not provided, the default gas limit will be used.',
					},
				],
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['executeBatch', 'executeAsDelegatorBatch'],
					},
				},
				options: [
					{
						displayName: 'Atomic',
						name: 'atomic',
						type: 'boolean',
						default: true,
						description:
							'Whether or not all the transactions in the batch must succeed, or the entire batch is rolled back',
					},
					{
						displayName: 'Memo',
						name: 'memo',
						type: 'string',
						default: '',
						description:
							'Optional text to include with the Transaction after the batch is executed',
					},
					{
						displayName: 'Authorization List',
						name: 'authorizationList',
						type: 'json',
						default: '[]',
						description: 'List of ERC-7702 authorizations for the batch execution',
					},
					{
						displayName: 'Gas Limit',
						name: 'gasLimit',
						type: 'string',
						default: '',
						description:
							'The gas limit to use for the batch execution. The higher of either this value or the estimated gas will be used.',
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			loadContractMethodExecutionOptions,
			loadWalletOptions,
		},
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();
		const returnData = [];
		const errorData = [];

		try {
			for (let i = 0; i < items.length; i++) {
				const operation = this.getNodeParameter('operation', i) as string;
				if (operation === 'execute') {
					const response = await executeAndWaitContractMethodOperation(this, i);
					if (response.success) {
						returnData.push({
							json: { ...response.result } as IDataObject,
							pairedItem: { item: i },
						});
					} else {
						errorData.push({
							json: { ...response.result } as IDataObject,
							pairedItem: { item: i },
						});
					}
				} else if (operation === 'executeAsDelegator') {
					const response = await executeAsDelegatorAndWaitContractMethodOperation(this, i);
					if (response.success) {
						returnData.push({
							json: { ...response.result } as IDataObject,
							pairedItem: { item: i },
						});
					} else {
						errorData.push({
							json: { ...response.result } as IDataObject,
							pairedItem: { item: i },
						});
					}
				} else if (operation === 'executeBatch') {
					const response = await executeBatchAndWaitOperation(this, i);
					if (response.success) {
						returnData.push({
							json: { ...response.result } as IDataObject,
							pairedItem: { item: i },
						});
					} else {
						errorData.push({
							json: { ...response.result } as IDataObject,
							pairedItem: { item: i },
						});
					}
				} else if (operation === 'executeAsDelegatorBatch') {
					const response = await executeAsDelegatorBatchAndWaitOperation(this, i);
					if (response.success) {
						returnData.push({
							json: { ...response.result } as IDataObject,
							pairedItem: { item: i },
						});
					} else {
						errorData.push({
							json: { ...response.result } as IDataObject,
							pairedItem: { item: i },
						});
					}
				}
			}
		} catch (error) {
			errorData.push({ json: { ...error } as IDataObject, pairedItem: { item: 0 } });
		}

		return [returnData, errorData];
	}
}
