import { INodeProperties } from 'n8n-workflow';

export function createChain(
	required: boolean,
	resource: string,
	operations: string[],
): INodeProperties {
	return {
		displayName: 'Chain Name or ID',
		name: 'chainId',
		type: 'options',
		default: '',
		typeOptions: {
			loadOptionsMethod: required ? 'loadChainOptions' : 'loadChainOptionsWithAll',
		},
		required: required,
		displayOptions: {
			show: {
				resource: [resource],
				operation: operations,
			},
		},

		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	};
}
