import { promptApi } from "@/api/prompt";
import { useMutation } from "@tanstack/react-query";

export function useDeletePrompt() {
	const deletePromptMutation = useMutation({
		mutationFn: async (id: number) => {
			await promptApi.deletePrompt(id);
		},
	});

	const deletePrompt = async (id: number): Promise<boolean> => {
		try {
			await deletePromptMutation.mutateAsync(id);
			return true;
		} catch (err: any) {
			console.error("Delete prompt error:", err);
			return false;
		}
	};

	return {
		deletePrompt,
		loading: deletePromptMutation.isPending,
		error: deletePromptMutation.error?.message || null,
	};
}
