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
		displayName: 'Delegator Wallet Address',
		name: 'delegatorWalletAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contractMethods'],
				operation: ['executeAsDelegator'],
			},
		},
		default: '',
		description: 'The address of the delegator wallet to use for the contract method',
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
				operation: ['execute'],
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
				operation: ['executeAsDelegator'],
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
				operation: ['assureContractMethodsFromPrompt'],
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
];

export const contractMethodOperationsFields: INodeProperties[] = [
	...contractMethodOperations,
	...contractMethodFields,
];
