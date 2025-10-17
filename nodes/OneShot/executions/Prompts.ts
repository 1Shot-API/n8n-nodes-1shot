import { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { EChain, FullPrompt } from '../types/1shot';
import { additionalCredentialOptions, oneshotApiBaseUrl } from '../types/constants';

export async function searchPromptsOperation(context: IExecuteFunctions, index: number) {
	const query = context.getNodeParameter('query', index) as string;
	const chainId = context.getNodeParameter('chainId', index) as string;

	return await searchPrompts(
		context,
		query,
		chainId == 'all' ? undefined : (Number(chainId) as EChain),
	);
}

export async function searchPrompts(
	context: IExecuteFunctions | ILoadOptionsFunctions,
	query: string,
	chainId?: EChain,
): Promise<FullPrompt[]> {
	try {
		const response: FullPrompt[] = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: '/prompts/search',
				body: {
					query,
					chainId,
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
		context.logger.error(`Error searching prompts ${error.message}`, { error });
		throw error;
	}
}
