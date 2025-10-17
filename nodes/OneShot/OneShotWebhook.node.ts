import {
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { webhookTrigger } from './executions/Webhooks';
import { loadX402TokenOptions } from './executions/options';

export class OneShotWebhook implements INodeType {
	description: INodeTypeDescription = {
		displayName: '1Shot API Webhook',
		name: 'oneShotWebhook',
		icon: { light: 'file:oneshot.svg', dark: 'file:oneshot.svg' },
		group: ['trigger'],
		version: 1,
		description: 'Starts the workflow when a 1Shot API webhook is received and authenticated',
		defaults: {
			name: '1Shot API Webhook',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: '1shot',
			},
		],
		credentials: [
			{
				name: 'oneShotOAuth2Api',
				required: true,
			},
		],
		supportsCORS: true,
		triggerPanel: {
			header: '',
			executionsHelp: {
				inactive:
					'Webhooks have two modes: test and production. <br /> <br /> <b>Use test mode while you build your workflow</b>. Click the \'listen\' button, then make a request to the test URL. The executions will show up in the editor.<br /> <br /> <b>Use production mode to run your workflow automatically</b>. <a data-key="activate">Activate</a> the workflow, then make requests to the production URL. These executions will show up in the executions list, but not in the editor.',
				active:
					'Webhooks have two modes: test and production. <br /> <br /> <b>Use test mode while you build your workflow</b>. Click the \'listen\' button, then make a request to the test URL. The executions will show up in the editor.<br /> <br /> <b>Use production mode to run your workflow automatically</b>. Since the workflow is activated, you can make requests to the production URL. These executions will show up in the <a data-key="executions">executions list</a>, but not in the editor.',
			},
			activationHint:
				"Once you've finished building your workflow, run it without having to click this button by using the production webhook URL.",
		},
		properties: [
			{
				displayName: 'Webhook Type',
				name: 'webhookType',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: '1Shot Signature Verification',
						value: 'oneshot',
						description: 'Standard 1Shot webhook with ED-25519 signature verification',
					},
					{
						name: 'X402 Payment Gateway',
						value: 'x402',
						description: 'X402 payment-gated webhook requiring authorization',
					},
				],
				default: 'oneshot',
				description: 'Choose the type of webhook verification to use',
			},
			{
				displayName: 'Public Key',
				name: 'publicKey',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						webhookType: ['oneshot'],
					},
				},
				default: '',
				description: 'The ED-25519 public key provided by 1Shot for webhook verification',
			},
			{
				displayName: 'Allow Multiple HTTP Methods',
				name: 'multipleMethods',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						webhookType: ['x402'],
					},
				},
				isNodeSetting: true,
				description: 'Whether to allow the webhook to listen for multiple HTTP methods',
			},
			{
				displayName: 'HTTP Method',
				name: 'httpMethod',
				type: 'options',
				options: [
					{
						name: 'DELETE',
						value: 'DELETE',
					},
					{
						name: 'GET',
						value: 'GET',
					},
					{
						name: 'HEAD',
						value: 'HEAD',
					},
					{
						name: 'PATCH',
						value: 'PATCH',
					},
					{
						name: 'POST',
						value: 'POST',
					},
					{
						name: 'PUT',
						value: 'PUT',
					},
				],
				default: 'GET',
				description: 'The HTTP method to listen to',
				displayOptions: {
					show: {
						multipleMethods: [false],
						webhookType: ['x402'],
					},
				},
			},
			{
				displayName: 'HTTP Methods',
				name: 'httpMethod',
				type: 'multiOptions',
				options: [
					{
						name: 'DELETE',
						value: 'DELETE',
					},
					{
						name: 'GET',
						value: 'GET',
					},
					{
						name: 'HEAD',
						value: 'HEAD',
					},
					{
						name: 'PATCH',
						value: 'PATCH',
					},
					{
						name: 'POST',
						value: 'POST',
					},
					{
						name: 'PUT',
						value: 'PUT',
					},
				],
				default: ['GET', 'POST'],
				description: 'The HTTP methods to listen to',
				displayOptions: {
					show: {
						multipleMethods: [true],
						webhookType: ['x402'],
					},
				},
			},
			{
				displayName: 'Path',
				name: 'path',
				type: 'string',
				default: '',
				placeholder: 'webhook',
				displayOptions: {
					show: {
						webhookType: ['x402'],
					},
				},
				description:
					"The path to listen to, dynamic values could be specified by using ':', e.g. 'your-path/:dynamic-value'. If dynamic values are set 'webhookId' would be prepended to path.",
			},
			{
				displayName: 'Response Code',
				name: 'responseCode',
				placeholder: 'Add Response Code',
				type: 'fixedCollection',
				default: {
					values: {
						responseCode: 200,
					},
				},
				options: [
					{
						name: 'values',
						displayName: 'Values',
						values: [
							responseCodeSelector,
							{
								displayName: 'Code',
								name: 'customCode',
								type: 'number',
								default: 200,
								placeholder: 'e.g. 400',
								typeOptions: {
									minValue: 100,
								},
								displayOptions: {
									show: {
										responseCode: ['customCode'],
									},
								},
							},
						],
					},
				],
				displayOptions: {
					show: {
						webhookType: ['x402'],
					},
				},
			},
			{
				displayName: 'Response Data',
				name: 'responseData',
				type: 'options',
				displayOptions: {
					show: {
						webhookType: ['x402'],
					},
				},
				options: [
					{
						name: 'All Entries',
						value: 'allEntries',
						description: 'Returns all the entries of the last node. Always returns an array.',
					},
					{
						name: 'First Entry JSON',
						value: 'firstEntryJson',
						description:
							'Returns the JSON data of the first entry of the last node. Always returns a JSON object.',
					},
					{
						name: 'First Entry Binary',
						value: 'firstEntryBinary',
						description:
							'Returns the binary data of the first entry of the last node. Always returns a binary file.',
					},
					{
						name: 'No Response Body',
						value: 'noData',
						description: 'Returns without a body',
					},
				],
				default: 'firstEntryJson',
				description:
					'What data should be returned. If it should return all items as an array or only the first item as object.',
			},
			{
				displayName: 'Tokens',
				name: 'tokens',
				type: 'fixedCollection',
				required: true,
				displayOptions: {
					show: {
						webhookType: ['x402'],
					},
				},
				default: [],
				description: 'The tokens that will be accepted for payment',
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'paymentToken',
						displayName: 'Payment Token',
						// eslint-disable-next-line n8n-nodes-base/node-param-fixed-collection-type-unsorted-items
						values: [
							{
								displayName: 'Payment Token Name or ID',
								name: 'paymentToken',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'loadX402TokenOptions',
								},
								required: true,
								default: '',
								description:
									'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
							},
							{
								displayName: 'Pay To Address',
								name: 'payToAddress',
								type: 'string',
								required: true,
								default: '',
								description:
									'The address that will receive the payment. Should be in the form of an EVM address with the leading 0x.',
							},
							{
								displayName: 'Payment Amount',
								name: 'paymentAmount',
								type: 'number',
								required: true,
								default: 1000000,
								description:
									'The minimum payment amount required to trigger the workflow. This is in Wei for the token specified. For example, USDC has 6 decimals, so for $1.00 payment enter 1000000.',
							},
						],
					},
				],
			},
			{
				displayName: 'Optional Fields',
				name: 'optionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						webhookType: ['x402'],
					},
				},
				options: [
					{
						displayName: 'Resource Description',
						name: 'resourceDescription',
						type: 'string',

						default: '',
						description: 'A description of this x402-gated resource',
					},
					{
						displayName: 'Mime Type',
						name: 'mimeType',
						type: 'string',
						default: 'application/json',
						description:
							'The mime type of the resource. Leave blank for no mime type. For n8n, this is almost always application/JSON',
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			loadX402TokenOptions,
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		return webhookTrigger.call(this);
	}
}
