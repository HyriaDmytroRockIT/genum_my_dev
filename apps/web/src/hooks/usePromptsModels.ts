import { useCallback, useState } from "react";
import useQueryWithAuth from "./useQueryWithAuth";
import { useMutation } from "@tanstack/react-query";
import { ResponseModelConfig } from "@/types/AIModel";
import { promptApi, ModelConfig } from "@/api/prompt";

// Define types for model and model configuration
interface Model {
	id: number;
	name: string;
	vendor: string;
	promptPrice: number;
	completionPrice: number;
	contextTokensMax: number;
	completionTokensMax: number;
	description: string;
	createdAt: string;
	updatedAt: string;
}

export function usePromptsModels() {
	const [models, setModels] = useState<Model[]>([]);
	const [modelConfig, setModelConfig] = useState<ResponseModelConfig | null>(null);

	const {
		refetch: refetchModels,
		isFetching: isLoadingModels,
		error: modelsError,
	} = useQueryWithAuth<{ models: Model[] }>({
		keys: ["prompts", "models"],
		enabled: false,
		queryFn: async () => {
			return await promptApi.getModels();
		},
		onError: (error) => {
			console.error("❌ Fetch models error:", error);
		},
	});

	const updatePromptModelMutation = useMutation({
		mutationFn: async ({ promptId, modelId }: { promptId: number; modelId: number }) => {
			return await promptApi.updatePromptModel(promptId, modelId);
		},
	});

	const updateModelSettingsMutation = useMutation({
		mutationFn: async ({
			promptId,
			payload,
		}: {
			promptId: number;
			payload: Record<string, any>;
		}) => {
			return await promptApi.updateModelConfig(promptId, payload);
		},
	});

	const getModels = useCallback(async (): Promise<boolean> => {
		try {
			const result = await refetchModels();
			if (result.data?.models) {
				setModels(result.data.models);
				return true;
			}
			return false;
		} catch (err: any) {
			console.error("❌ Fetch models error:", err);
			return false;
		}
	}, [refetchModels]);

	const getModelConfig = useCallback(async (id: number): Promise<ModelConfig | null> => {
		try {
			const data = await promptApi.getModelConfig(id);
			// Convert ModelConfig to ResponseModelConfig format for state
			const responseConfig: ResponseModelConfig = {
				name: "",
				vendor: "",
				parameters: {},
			};
			setModelConfig(responseConfig);
			return data.config;
		} catch (err: any) {
			console.error("❌ Fetch model configuration error:", err);
			return null;
		}
	}, []);

	const updatePromptModel = useCallback(
		async (promptId: number, modelId: number): Promise<boolean> => {
			if (!promptId || !modelId) return false;

			try {
				await updatePromptModelMutation.mutateAsync({ promptId, modelId });
				return true;
			} catch (err: any) {
				console.error("❌ Error updating prompt model:", err);
				return false;
			}
		},
		[updatePromptModelMutation.mutateAsync],
	);

	const updateModelSettings = useCallback(
		async (promptId: number, payload: Record<string, any>): Promise<boolean> => {
			if (!promptId) return false;

			try {
				await updateModelSettingsMutation.mutateAsync({ promptId, payload });
				return true;
			} catch (err: any) {
				console.error("❌ Error updating model settings:", err);
				return false;
			}
		},
		[updateModelSettingsMutation.mutateAsync],
	);

	const loading =
		isLoadingModels ||
		updatePromptModelMutation.isPending ||
		updateModelSettingsMutation.isPending;
	const error =
		modelsError?.message ||
		updatePromptModelMutation.error?.message ||
		updateModelSettingsMutation.error?.message ||
		null;

	return {
		getModels,
		getModelConfig,
		updatePromptModel,
		updateModelSettings,
		models,
		modelConfig,
		loading,
		error,
	};
}
