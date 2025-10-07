import { INodeProperties } from 'n8n-workflow';
import { createChain } from './CommonDescriptions';

export const contractEventOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['contractEvents'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new contract event definition',
				action: 'Create a contract event',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a contract event definition',
				action: 'Delete a contract event',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a single contract event definition',
				action: 'Get a contract event',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all contract event definitions',
				action: 'List all contract events',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search for contract event logs on the blockchain',
				action: 'Search contract event logs',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an existing contract event definition',
				action: 'Update a contract event',
			},
		],
		default: 'list',
	},
];

const contractEventFields: INodeProperties[] = [
	{
		displayName: 'Contract Event Name or ID',
		name: 'contractEventId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'loadContractEventOptions',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['contractEvents'],
				operation: ['get', 'update', 'delete', 'search'],
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
		displayOptions: {
			show: {
				resource: ['contractEvents'],
				operation: ['list'],
			},
		},
		default: '',
		description: 'Filter contract events by name',
	},
	{
		displayName: 'Contract Address',
		name: 'contractAddress',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contractEvents'],
				operation: ['list'],
			},
		},
		default: '',
		description: 'Filter contract events by contract address',
	},
	{
		displayName: 'Event Name',
		name: 'eventName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contractEvents'],
				operation: ['list'],
			},
		},
		default: '',
		description: 'Filter contract events by event name',
	},
	createChain(true, 'contractEvents', ['create']),
	createChain(false, 'contractEvents', ['list']),
	{
		displayName: 'Contract Address',
		name: 'contractAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contractEvents'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Enter the address of the contract to monitor for events',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contractEvents'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'A human-readable name for this event definition',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contractEvents'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'A description of what this event represents',
	},
	{
		displayName: 'Event Name',
		name: 'eventName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contractEvents'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The exact name of the event as defined in the contract ABI',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contractEvents'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Updated name for the event definition',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contractEvents'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Updated description for the event definition',
	},
	{
		displayName: 'Start Block',
		name: 'startBlock',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['contractEvents'],
				operation: ['search'],
			},
		},
		default: '',
		description: 'Starting block number to search from',
	},
	{
		displayName: 'End Block',
		name: 'endBlock',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['contractEvents'],
				operation: ['search'],
			},
		},
		default: '',
		description: 'Ending block number to search to',
	},
	{
		displayName: 'Topics',
		name: 'topics',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['contractEvents'],
				operation: ['search'],
			},
		},
		default: {},
		description: 'Filter by indexed event parameters. Add topic name-value pairs to filter the search results.',
		options: [
			{
				name: 'topic',
				displayName: 'Topic',
				values: [
					{
						displayName: 'Topic Name',
						name: 'name',
						type: 'string',
						required: true,
						default: '',
						description: 'The name of the indexed topic parameter (e.g., "from", "to", "tokenId")',
					},
					{
						displayName: 'Topic Value',
						name: 'value',
						type: 'string',
						required: true,
						default: '',
						description: 'The value to filter by (e.g., "0x1234567890123456789012345678901234567890")',
					},
				],
			},
		],
	},
	{
		displayName: 'Page Number',
		name: 'page',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['contractEvents'],
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
				resource: ['contractEvents'],
				operation: ['list'],
			},
		},
		default: 25,
		description: 'Enter the size of the page to get',
	},
];

export const contractEventOperationsFields: INodeProperties[] = [
	...contractEventOperations,
	...contractEventFields,
];
