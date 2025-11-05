import { INodeProperties } from 'n8n-workflow';
import { createChain } from './CommonDescriptions';

export const walletOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['wallets'],
			},
		},
		options: [
			{
				name: 'Create Wallet',
				value: 'create',
				description: 'Creates a new Wallet. It will be empty until you add funds to it.',
				action: 'Create wallet',
			},
			{
				name: 'Delete Wallet',
				value: 'delete',
				description: 'Deletes a Wallet',
				action: 'Delete wallet',
			},
			{
				name: 'Get Wallet',
				value: 'get',
				description: 'Get a specific Wallet',
				action: 'Get wallet',
			},
			{
				name: 'List Wallets',
				value: 'list',
				description: 'List Wallets for a given chain',
				action: 'List wallets',
			},
			{
				name: 'Update Wallet',
				value: 'update',
				description: 'Update a Wallet',
				action: 'Update wallet',
			},
		],
		default: 'list',
	},
];

const walletFields: INodeProperties[] = [
	createChain(false, 'wallets', ['list', 'update']),
	createChain(true, 'wallets', ['create']),
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['wallets'],
				operation: ['list'],
			},
		},
		default: '',
		description: 'Filter wallets by name',
	},
	{
		displayName: 'Wallet Name or ID',
		name: 'walletId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['wallets',],
				operation: ['get'],
			},
		},
		default: '',
		description:
			'Enter the ID of the Wallet you want to get, update, or delete or use an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
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
				resource: ['wallets'],
				operation: ['update', 'delete'],
			},
		},
		default: '',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['wallets'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'The name of the wallet',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['wallets'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'A description of the wallet',
	},
	{
		displayName: 'Page Number',
		name: 'page',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['wallets'],
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
				resource: ['wallets'],
				operation: ['list'],
			},
		},
		default: 25,
		description: 'Enter the size of the page to get',
	},
];

export const walletOperationsFields: INodeProperties[] = [...walletOperations, ...walletFields];
