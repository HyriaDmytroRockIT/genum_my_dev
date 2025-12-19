import { promptApi } from "@/api/prompt";
import { useMutation } from "@tanstack/react-query";

interface PromptData {
	name: string;
	value: string;
}

export function useCreatePrompt() {
	const createPromptMutation = useMutation({
		mutationFn: async (data: PromptData) => {
			const result = await promptApi.createPrompt(data);
			return result.prompt;
		},
	});

	const createPrompt = async (data: PromptData) => {
		return await createPromptMutation.mutateAsync(data);
	};

	return {
		createPrompt,
		loading: createPromptMutation.isPending,
		error: createPromptMutation.error?.message || null,
	};
}
