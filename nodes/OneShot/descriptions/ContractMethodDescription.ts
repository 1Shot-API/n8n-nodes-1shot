import { INodeProperties } from 'n8n-workflow';
import { createChain } from './CommonDescriptions';

export const contractMethodOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['contractMethods'],
			},
		},
		options: [
			{
				name: 'Assure Contract Methods From Prompt',
				value: 'assureContractMethodsFromPrompt',
				description:
					'This will make sure you have a set of Contract Methods ready to use based on your chosen Prompt',
				action: 'Assure contract methods from prompt',
			},
			{
				name: 'Encode',
				value: 'encode',
				description:
					'Encode a contract method call. This produces the calldata for the contract method, which is sometimes required for other contract methods.',
				action: 'Encode a smart contract method call',
			},
			{
				name: 'Estimate',
				value: 'estimate',
				description: 'Get an estimate of the gas cost of a contract method',
				action: 'Estimate the gas cost of a smart contract method',
			},
			{
				name: 'Execute',
				value: 'execute',
				description: 'Execute a smart contract method on the blockchain',
				action: 'Execute a smart contract method',
			},
			{
				name: 'Execute as Delegator',
				value: 'executeAsDelegator',
				description:
					'Execute a smart contract method on the blockchain using a stored ERC-7710 delegation',
				action: 'Execute a smart contract method as delegator',
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
			{
				name: 'Get',
				value: 'get',
				description: 'Get a single smart contract method',
				action: 'Get a smart contract method',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all smart contract methods',
				action: 'List all smart contract methods',
			},
			{
				name: 'Read',
				value: 'read',
				description: 'Read data from a smart contract view or pure function',
				action: 'Read data from a smart contract function',
			},
			{
				name: 'Simulate',
				value: 'simulate',
				description:
					'Simulate a smart contract method call and see if it would succeed with the current state of the chain',
				action: 'Simulate a smart contract method call',
			},
		],
		default: 'execute',
	},
];

const contractMethodFields: INodeProperties[] = [
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
				resource: ['contractMethods'],
				operation: ['execute', 'executeAsDelegator', 'encode', 'estimate', 'simulate'],
			},
		},
		default: '',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Contract Method Name or ID',
		name: 'contractMethodId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'loadContractMethodReadOptions',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['contractMethods'],
				operation: ['read'],
			},
		},
		default: '',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
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
				resource: ['contractMethods'],
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
								displayName: 'Contract Address Override',
								name: 'contractAddress',
								type: 'string',
								default: '',
								description:
									'Set this to override the default contract address for this method execution',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'The amount of native token to send along with the Contract Method',
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
				resource: ['contractMethods'],
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
						default: '',
						description:
							'The address of the delegator on whose behalf the transaction will be executed. Note: You can only use one of delegatorAddress, delegationId, or delegationData.',
					},
					{
						displayName: 'Delegation ID',
						name: 'delegationId',
						type: 'string',
						default: '',
						description:
							'The ID of a specific delegation to use for this transaction. This is the best way to ensure that 1Shot API uses the correct delegation. Note: You can only use one of delegatorAddress, delegationId, or delegationData.',
					},
					{
						displayName: 'Delegation Data',
						name: 'delegationData',
						type: 'json',
						default: '',
						description:
							'A delegation object to use for the transaction. This is treated as a one-time use delegation and not stored in 1Shot API for reuse. Enter a JSON object (e.g., {"authority":"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff","caveats":[],"delegate":"0x74847c451c3745fcdf4fd447a9fa5eef8a6791a9","delegator":"0x3e6a2f0CBA03d293B54c9fCF354948903007a798","salt":"0x","signature":"0x000007dc509f5f440bd07e2a51cb8dd135f170bc8886ccf24c35652d256d4f06501537e663fbb3b6e51ca640ad4791fb605ba7434d4d8a0a0a24bfd4d841e88f1c"}). Note: You can only use one of delegatorAddress, delegationId, or delegationData.',
					},
					{
						displayName: 'Optional Fields',
						name: 'optionalFields',
						type: 'collection',
						placeholder: 'Add Field',
						default: {},
						options: [
							{
								displayName: 'Contract Address Override',
								name: 'contractAddress',
								type: 'string',
								default: '',
								description:
									'Set this to override the default contract address for this method execution',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'The amount of native token to send along with the Contract Method',
							},
						],
					},
				],
			},
		],
	},
	{
		displayName: 'Parameters',
		name: 'params',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['contractMethods'],
				operation: ['execute', 'executeAsDelegator', 'encode', 'estimate', 'simulate', 'read'],
			},
		},
		default: '{}',
		description:
			'The parameters to pass to the Contract Method. Enter a JSON object (e.g., {"to": "0x3e6a2f0CBA03d293B54c9fCF354948903007a798", "amount": "10000"}).',
	},
	{
		displayName: 'You must use one of either delegatorAddress, delegationId, or delegationData.',
		name: 'delegationInfoMessage',
		type: 'notice',
		default: '',
		displayOptions: {
			show: {
				resource: ['contractMethods'],
				operation: ['executeAsDelegator'],
			},
		},
	},
	{
		displayName: 'Delegator Wallet Address',
		name: 'delegatorWalletAddress',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contractMethods'],
				operation: ['executeAsDelegator'],
			},
		},
		default: '',
		description:
			'The address of the delegator wallet to use for the contract method. Note: You can only use one of delegatorAddress, delegationId, or delegationData.',
	},
	{
		displayName: 'Delegation ID',
		name: 'delegationId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['contractMethods'],
				operation: ['executeAsDelegator'],
			},
		},
		description:
			'The ID of a specific delegation to use for this transaction. This is the best way to ensure that 1Shot API uses the correct delegation. Note: You can only use one of delegatorAddress, delegationId, or delegationData.',
	},
	{
		displayName: 'Delegation Data',
		name: 'delegationData',
		type: 'json',
		default: '',
		displayOptions: {
			show: {
				resource: ['contractMethods'],
				operation: ['executeAsDelegator'],
			},
		},
		description:
			'A delegation object to use for the transaction. This is treated as a one-time use delegation and not stored in 1Shot API for reuse. Enter a JSON object (e.g., {"authority":"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff","caveats":[],"delegate":"0x74847c451c3745fcdf4fd447a9fa5eef8a6791a9","delegator":"0x3e6a2f0CBA03d293B54c9fCF354948903007a798","salt":"0x","signature":"0x000007dc509f5f440bd07e2a51cb8dd135f170bc8886ccf24c35652d256d4f06501537e663fbb3b6e51ca640ad4791fb605ba7434d4d8a0a0a24bfd4d841e88f1c"}). Note: You can only use one of delegatorAddress, delegationId, or delegationData.',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contractMethods'],
				operation: ['list'],
			},
		},
		default: '',
		description: 'Filter contract methods by name',
	},
	{
		displayName: 'Contract Address',
		name: 'contractAddress',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contractMethods'],
				operation: ['list'],
			},
		},
		default: '',
		description: 'Filter contract methods by contract address',
	},
	{
		displayName: 'Prompt ID',
		name: 'promptId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contractMethods'],
				operation: ['list'],
			},
		},
		default: '',
		description: 'Filter contract methods by prompt ID',
	},
	{
		displayName: 'Method Type',
		name: 'methodType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['contractMethods'],
				operation: ['list'],
			},
		},
		options: [
			{
				name: 'None',
				value: '',
			},
			{
				name: 'Read',
				value: 'read',
			},
			{
				name: 'Write',
				value: 'write',
			},
		],
		default: '',
		description: 'Filter contract methods by type',
	},
	{
		displayName: 'Contract Method ID',
		name: 'contractMethodId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contractMethods'],
				operation: ['get'],
			},
		},
		default: '',
		description: 'Enter the ID of the Contract Method you want to get',
	},
	createChain(true, 'contractMethods', ['assureContractMethodsFromPrompt']),
	createChain(false, 'contractMethods', ['list']),
	{
		displayName: 'Contract Address',
		name: 'contractAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contractMethods'],
				operation: ['assureContractMethodsFromPrompt'],
			},
		},
		default: '',
		description:
			'Enter the address of the contract to assure contract methods from. This is required, and can be pulled from the prompt if needed.',
	},
	{
		displayName: 'Prompt ID',
		name: 'promptId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contractMethods'],
				operation: ['assureContractMethodsFromPrompt'],
			},
		},
		default: '',
		description: 'Enter the ID of the Prompt to assure contract methods from',
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
				resource: ['contractMethods'],
				operation: ['assureContractMethodsFromPrompt', 'executeBatch', 'executeAsDelegatorBatch'],
			},
		},
		default: '',
		description:
			'Select the Wallet to use for the contract methods. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Gas Limit',
		name: 'gasLimit',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contractMethods'],
				operation: ['simulate'],
			},
		},
		default: '',
		description:
			'The gas limit to use for the Contract Method. If not provided, the default gas limit will be used.',
	},
	{
		displayName: 'Page Number',
		name: 'page',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['contractMethods'],
				operation: ['list'],
			},
		},
		default: 1,
		description: 'Enter the page number to get. This starts at 1.',
	},
	{
		displayName: 'Page Size',
		name: 'pageSize',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['contractMethods'],
				operation: ['list'],
			},
		},
		default: 25,
		description: 'Enter the size of the page to get',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['contractMethods'],
				operation: ['execute', 'executeAsDelegator'],
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-param-collection-type-unsorted-items
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
				displayName: 'Contract Address Override',
				name: 'contractAddress',
				type: 'string',
				default: '',
				description: 'Set this to override the default contract address for this method execution',
			},
			{
				displayName: 'Value',
				name: 'value',
				type: 'string',
				default: '',
				description: 'The amount of native token to send along with the Contract Method',
			},
			{
				displayName: 'Authorization List',
				name: 'authorizationList',
				type: 'json',
				default: '[]',
				description: 'List of ERC-7702 authorizations for the Contract Method',
			},
			{
				displayName: 'Gas Limit',
				name: 'gasLimit',
				type: 'string',
				default: '',
				description:
					'The gas limit to use for the Contract Method. The higher of either this value or the estimated gas will be used.',
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
				resource: ['contractMethods'],
				operation: ['encode'],
			},
		},
		options: [
			{
				displayName: 'Authorization List',
				name: 'authorizationList',
				type: 'json',
				default: '[]',
				description: 'List of ERC-7702 authorizations for the Contract Method',
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
				resource: ['contractMethods'],
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
				description: 'Optional text to include with the Transaction after the batch is executed',
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
];

export const contractMethodOperationsFields: INodeProperties[] = [
	...contractMethodOperations,
	...contractMethodFields,
];
