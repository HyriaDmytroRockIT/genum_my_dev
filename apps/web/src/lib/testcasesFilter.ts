import { TestcaseStatuses } from "@/types/Prompt";
import { TestCase, TestStatus } from "@/types/TestСase";

export type FilterState = {
	prompts?: number[];
	testcasesStatus?: TestStatus[];
};

export const testcasesFilter = (
	testcases: TestCase[],
	search: string,
	filterState: FilterState,
) => {
	if (!testcases) return [];

	return testcases.filter((item: TestCase) => {
		const nameMatches = !search || item.name.toLowerCase().includes(search.toLowerCase());

		const promptMatches =
			!filterState.prompts ||
			filterState.prompts.length === 0 ||
			filterState.prompts.includes(item.promptId);

		const caseStatusMatches =
			!filterState.testcasesStatus ||
			filterState.testcasesStatus.length === 0 ||
			filterState.testcasesStatus.includes(item.status);

		return promptMatches && nameMatches && caseStatusMatches;
	});
};

export const matchesTestcaseStatus = (statuses: TestcaseStatuses = {}, statusFilters: string[]) => {
	if (statusFilters.length === 0 || statusFilters.includes("All")) return true;

	if (statusFilters.includes("Pass") && statuses.OK && statuses.OK > 0) return true;
	if (statusFilters.includes("Fail") && statuses.NOK && statuses.NOK > 0) return true;

	return !!(statusFilters.includes("Need run") && statuses.NEED_RUN && statuses.NEED_RUN > 0);
};
