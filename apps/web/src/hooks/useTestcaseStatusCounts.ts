import useQueryWithAuth from "@/hooks/useQueryWithAuth";
import { useEffect } from "react";
import { usePlaygroundActions } from "@/stores/playground.store";
import { TestCase } from "@/types/TestСase";
import { promptApi } from "@/api/prompt";

type TestCaseList = {
	testcases: TestCase[];
};

export const useTestcaseStatusCounts = (promptId?: number | string) => {
	const { setTestcaseStatusCounts } = usePlaygroundActions();

	const { data, refetch, isLoading } = useQueryWithAuth<TestCaseList>({
		keys: ["testcasesForPromt", String(promptId || "none")],
		enabled: !!promptId,
		queryFn: async () => {
			if (!promptId) throw new Error("Prompt ID is required");
			return await promptApi.getPromptTestcases(promptId);
		},
	});

	useEffect(() => {
		if (data?.testcases) {
			const counts = { ok: 0, nok: 0, needRun: 0 };
			data.testcases.forEach((tc) => {
				if (tc.status === "OK") {
					counts.ok++;
				} else if (tc.status === "NOK") {
					counts.nok++;
				} else if (tc.status === "NEED_RUN") {
					counts.needRun++;
				}
			});
			setTestcaseStatusCounts(counts);
		} else {
			setTestcaseStatusCounts({ ok: 0, nok: 0, needRun: 0 });
		}
	}, [data, setTestcaseStatusCounts]);

	return { data, refetch, isLoading };
};
