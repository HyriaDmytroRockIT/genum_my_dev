import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import useQueryWithAuth from "./useQueryWithAuth";
import { Prompt } from "@/pages/prompt/Prompts";
import { promptApi } from "@/api/prompt";

export function useProjectPrompts() {
	const { orgId, projectId } = useParams<{ orgId: string; projectId: string }>();
	const queryClient = useQueryClient();

	const { data, error, isLoading } = useQueryWithAuth<{ prompts: Prompt[] }>({
		keys: ["prompts", projectId || ""],
		enabled: !!projectId,
		queryFn: async () => {
			return await promptApi.getPrompts();
		},
	});

	const removePromptLocally = (id: number) => {
		queryClient.setQueryData(
			["prompts", projectId],
			(oldData: { prompts: Prompt[] } | undefined) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					prompts: oldData.prompts.filter((p) => p.id !== id),
				};
			},
		);
	};

	const addPromptLocally = (prompt: Prompt) => {
		queryClient.setQueryData(
			["prompts", projectId],
			(oldData: { prompts: Prompt[] } | undefined) => {
				if (!oldData) return { prompts: [prompt] };
				return {
					...oldData,
					prompts: [prompt, ...oldData.prompts],
				};
			},
		);
	};

	return {
		prompts: data?.prompts || [],
		error: error?.message || null,
		loading: isLoading,
		removePromptLocally,
		addPromptLocally,
	};
}
