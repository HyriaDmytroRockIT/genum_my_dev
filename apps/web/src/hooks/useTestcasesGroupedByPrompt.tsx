import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { promptApi } from "@/api/prompt";
import { testcasesApi, TestcasesListResponse } from "@/api/testcases/testcases.api";

interface Testcase {
	id: number;
	name: string;
	promptId: number;
	status: "OK" | "NOK" | "NEED_RUN";
}

interface Prompt {
	id: number;
	name: string;
}

interface TestcasesData {
	testcases: Testcase[];
}

interface PromptsData {
	prompts: Prompt[];
}

interface ChartDataItem {
	name: string;
	passed: number;
	failed: number;
	needRun: number;
	prompt_id: number;
}

interface PromptStats {
	prompt_id: number;
	total_requests: number;
	total_tokens_in: number;
	total_tokens_out: number;
	average_response_ms: number;
	total_cost: number;
	error_rate: number;
	last_used: string;
}

const useTestcasesGroupedByPrompt = (filteredPrompts?: PromptStats[]) => {
	const pathParts = window.location.pathname.split("/");
	const organizationId = pathParts[1];
	const projectId = pathParts[2];

	const {
		data: testcasesData,
		isLoading: testcasesLoading,
		error: testcasesError,
		refetch: refetchTestcases,
	} = useQuery<TestcasesListResponse>({
		queryKey: ["testcases", organizationId, projectId],
		enabled: !!organizationId && !!projectId,
		queryFn: async () => {
			return await testcasesApi.getTestcases();
		},
	});

	const {
		data: promptsData,
		isLoading: promptsLoading,
		error: promptsError,
	} = useQuery<PromptsData>({
		queryKey: ["prompts", organizationId, projectId],
		enabled: !!organizationId && !!projectId,
		queryFn: async () => {
			return await promptApi.getPrompts();
		},
	});

	const processedData = useMemo(() => {
		if (
			!testcasesData?.testcases ||
			!Array.isArray(testcasesData.testcases) ||
			!promptsData?.prompts
		) {
			return [];
		}

		const allowedPromptIds = filteredPrompts
			? new Set(filteredPrompts.map((p) => p.prompt_id))
			: null;

		const promptNamesMap = promptsData.prompts.reduce(
			(acc: Record<number, string>, prompt: Prompt) => {
				acc[prompt.id] = prompt.name;
				return acc;
			},
			{},
		);

		const groupedByPrompt = testcasesData.testcases.reduce(
			(acc: Record<number, ChartDataItem>, testcase: Testcase) => {
				const promptId = testcase.promptId;

				if (allowedPromptIds && !allowedPromptIds.has(promptId)) {
					return acc;
				}

				const promptName = promptNamesMap[promptId] || `Prompt ${promptId}`;

				if (!acc[promptId]) {
					acc[promptId] = {
						name: promptName,
						passed: 0,
						failed: 0,
						needRun: 0,
						prompt_id: promptId,
					};
				}

				if (testcase.status === "OK") {
					acc[promptId].passed++;
				} else if (testcase.status === "NOK") {
					acc[promptId].failed++;
				} else if (testcase.status === "NEED_RUN") {
					acc[promptId].needRun++;
				}

				return acc;
			},
			{},
		);

		return Object.values(groupedByPrompt).sort(
			(a: ChartDataItem, b: ChartDataItem) =>
				b.passed + b.failed + b.needRun - (a.passed + a.failed + a.needRun),
		);
	}, [testcasesData, promptsData, filteredPrompts, organizationId, projectId]);

	return {
		chartData: processedData,
		isLoading: testcasesLoading || promptsLoading,
		error: testcasesError || promptsError,
		refetch: refetchTestcases,
	};
};

export default useTestcasesGroupedByPrompt;
