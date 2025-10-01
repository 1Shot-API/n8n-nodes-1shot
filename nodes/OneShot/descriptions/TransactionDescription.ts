import { INodeProperties } from 'n8n-workflow';
import { createChain } from './CommonDescriptions';

export const transactionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['transactions'],
			},
		},
		options: [
			{
				name: 'List Transactions',
				value: 'list',
				description: 'List 1Shot API transactions with optional filters',
				action: 'List transactions',
			},
			{
				name: 'Get Transaction',
				value: 'get',
				description: 'Get a specific Transaction',
				action: 'Get transaction',
			},
		],
		default: 'list',
	},
];

const transactionFields: INodeProperties[] = [
	{
		displayName: 'Transaction Name or ID',
		name: 'transactionId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['transactions'],
				operation: ['get'],
			},
		},
		default: '',
		description: 'Enter the Transaction ID you want to get',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['transactions'],
				operation: ['list'],
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
		options: [
			{
				name: 'None',
				value: 'none',
			},
			{
				name: 'Pending',
				value: 'Pending',
			},
			{
				name: 'Submitted',
				value: 'Submitted',
			},
			{
				name: 'Completed',
				value: 'Completed',
			},
			{
				name: 'Retrying',
				value: 'Retrying',
			},
			{
				name: 'Failed',
				value: 'Failed',
			},
		],
		default: 'none',
		description: 'Filter transactions by status',
	},
	{
		displayName: 'Wallet ID',
		name: 'walletId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['transactions'],
				operation: ['list'],
			},
		},
		default: '',
		description: 'Filter transactions by wallet ID',
	},
	{
		displayName: 'Contract Method ID',
		name: 'contractMethodId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['transactions'],
				operation: ['list'],
			},
		},
		default: '',
		description: 'Filter transactions by contract method ID',
	},
	{
		displayName: 'API Credential ID',
		name: 'apiCredentialId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['transactions'],
				operation: ['list'],
			},
		},
		default: '',
		description: 'Filter transactions by API credential ID',
	},
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['transactions'],
				operation: ['list'],
			},
		},
		default: '',
		description: 'Filter transactions by user ID',
	},
	{
		displayName: 'Memo',
		name: 'memo',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['transactions'],
				operation: ['list'],
			},
		},
		default: '',
		description: 'Filter by memo text',
	},
	{
		displayName: 'After Time',
		name: 'createdAfter',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['transactions'],
				operation: ['list'],
			},
		},
		default: '',
		description: 'A unix timestamp to look for transactions after',
	},
	{
		displayName: 'Before Time',
		name: 'createdBefore',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['transactions'],
				operation: ['list'],
			},
		},
		default: '',
		description: 'A unix timestamp to look for transaction before',
	},
	{
		displayName: 'Page Number',
		name: 'page',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['transactions'],
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
				resource: ['transactions'],
				operation: ['list'],
			},
		},
		default: 25,
		description: 'Enter the size of the page to get',
	},
	createChain(false, 'transactions', ['list']),
];

export const transactionOperationsFields: INodeProperties[] = [
	...transactionOperations,
	...transactionFields,
];
