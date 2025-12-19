import { useParams } from "react-router-dom";
import { PromptSettings } from "@/types/Prompt";
import useQueryWithAuth from "./useQueryWithAuth";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { promptApi } from "@/api/prompt";

export type Options = { isWithoutUpdate: boolean };

type PromptResponse = {
	prompt: PromptSettings;
};

export function usePromptById(promptId: number | string | undefined) {
	const queryClient = useQueryClient();
	const queryKey = ["prompt", String(promptId)];

	const {
		data,
		isLoading: loading,
		error: queryError,
	} = useQueryWithAuth<PromptResponse>({
		keys: queryKey,
		enabled: !!promptId,
		queryFn: async () => {
			if (!promptId) throw new Error("Prompt ID is required");
			return await promptApi.getPrompt(promptId);
		},
	});

	const updatePromptMutation = useMutation<PromptResponse, Error, Partial<PromptSettings>>({
		mutationFn: async (updateData) => {
			if (!promptId) throw new Error("Prompt ID is required");
			return await promptApi.updatePrompt(promptId, updateData);
		},
		onSuccess: (data) => {
			if (data) {
				queryClient.setQueryData(queryKey, (oldData: any) => {
					if (!oldData) return data;
					return { ...oldData, prompt: data.prompt || data };
				});
			}
		},
	});

	const updatePromptName = async (updateData: Partial<PromptSettings>, options?: Options) => {
		if (!promptId) return;

		const updated = await updatePromptMutation.mutateAsync(updateData);
		return updated;
	};

	const error = queryError || updatePromptMutation.error;

	return {
		prompt: data,
		loading,
		error: error ? (error as Error).message : null,
		updatePromptName,
	};
}
