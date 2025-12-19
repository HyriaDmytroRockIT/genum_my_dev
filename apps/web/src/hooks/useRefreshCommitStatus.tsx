import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useQueryWithAuth from "./useQueryWithAuth";
import { promptApi } from "@/api/prompt";

type PromptResponse = {
	prompt?: {
		commited?: boolean;
		[key: string]: any;
	};
};

export function useRefreshCommitStatus(
	promptId: number | undefined,
	onCommitStatusChange?: (c: boolean) => void,
) {
	const queryClient = useQueryClient();

	const { refetch: refetchPrompt } = useQueryWithAuth<PromptResponse>({
		keys: ["prompt", String(promptId || "none")],
		enabled: false,
		queryFn: async () => {
			if (!promptId) throw new Error("Prompt ID is required");
			return await promptApi.getPrompt(promptId);
		},
		onError: (error) => {
			console.error("Failed to refresh commit status", error);
		},
	});

	return useCallback(async () => {
		if (!promptId) return false;
		try {
			const result = await refetchPrompt();
			if (result.data) {
				const commited = result.data.prompt?.commited ?? false;
				queryClient.setQueryData(["prompt", promptId], result.data);
				onCommitStatusChange?.(commited);
				return commited;
			}
		} catch (err) {
			console.error("Failed to refresh commit status", err);
		}
		return false;
	}, [promptId, refetchPrompt, queryClient, onCommitStatusChange]);
}
