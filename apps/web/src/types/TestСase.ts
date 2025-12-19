export type TestStatus = "OK" | "NOK" | "NEED_RUN";

export interface Memory {
	id: number;
	key: string;
}

export interface TestCase {
	id: number;
	name: string;
	promptId: number;
	input: string;
	expectedOutput: string;
	expectedChainOfThoughts: string;
	lastOutput: string;
	lastChainOfThoughts: string;
	memoryId: number | null;
	status: TestStatus;
	assertionThoughts: string;
	createdAt: string;
	updatedAt: string;
	memory: Memory | null;
}

export type TestCaseResponse = {
	testcase: TestCase;
};
