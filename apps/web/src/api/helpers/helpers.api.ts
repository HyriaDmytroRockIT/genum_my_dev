import { apiClient, ApiRequestConfig } from "../client";

// ============================================================================
// Types
// ============================================================================

export interface PromptTuneData {
	instruction: string;
	context?: string;
	input?: string;
	output?: string;
	expectedOutput?: string;
}

export interface PromptTuneResponse {
	prompt: string;
	chainOfThoughts?: string;
}

export interface SpeechToTextResponse {
	text: string;
}

export interface ContentPrettifyData {
	content: string;
}

export interface ContentPrettifyResponse {
	text: string;
}

// ============================================================================
// Helpers API
// ============================================================================

export const helpersApi = {
	/**
	 * Tune a prompt based on context
	 */
	promptTune: async (
		data: PromptTuneData,
		config?: ApiRequestConfig,
	): Promise<PromptTuneResponse> => {
		const response = await apiClient.post<PromptTuneResponse>(
			"/helpers/prompt-tune",
			data,
			config,
		);
		return response.data;
	},

	/**
	 * Convert speech to text
	 */
	speechToText: async (
		audioFile: Blob | File,
		config?: ApiRequestConfig,
	): Promise<SpeechToTextResponse> => {
		const formData = new FormData();
		formData.append("audio", audioFile);

		const requestConfig: ApiRequestConfig = {
			...config,
			withContentType: false,
		};

		const response = await apiClient.post<SpeechToTextResponse>(
			"/helpers/speech-to-text",
			formData,
			requestConfig,
		);
		return response.data;
	},

	/**
	 * Prettify content
	 */
	contentPrettify: async (
		data: ContentPrettifyData,
		config?: ApiRequestConfig,
	): Promise<ContentPrettifyResponse> => {
		const response = await apiClient.post<ContentPrettifyResponse>(
			"/helpers/content-prettify",
			data,
			config,
		);
		return response.data;
	},
};
