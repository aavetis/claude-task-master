import { BaseAIProvider } from './base-provider.js';

export class MCPProvider extends BaseAIProvider {
	constructor() {
		super();
		this.name = 'MCP';
	}

	validateAuth(_params) {
		// No API key needed
	}

	async #callSampling(params) {
		const { session, messages, systemPrompt, maxTokens, temperature } = params;
		if (!session || typeof session.requestSampling !== 'function') {
			throw new Error('MCP session with requestSampling required');
		}
		this.validateMessages(messages);
		try {
			const response = await session.requestSampling({
				messages,
				systemPrompt,
				maxTokens,
				temperature
			});
			return response;
		} catch (error) {
			this.handleError('server sampling', error);
		}
	}

	async generateText(params) {
		const res = await this.#callSampling(params);
		return { text: res?.content?.text || '', usage: null };
	}

	async streamText(params) {
		const result = await this.#callSampling(params);
		return result?.content?.text || '';
	}

	async generateObject(params) {
		const res = await this.#callSampling(params);
		let obj;
		try {
			obj = JSON.parse(res?.content?.text || '{}');
		} catch (_) {
			throw new Error('Failed to parse object from sampling response');
		}
		return { object: obj, usage: null };
	}
}
