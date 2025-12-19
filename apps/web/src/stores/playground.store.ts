import { createWithEqualityFn } from "zustand/traditional";
import { devtools } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { AuditData } from "@/types/audit";
import { PromptResponse } from "@/hooks/useRunPrompt";

export const defaultPromptResponse: PromptResponse = {
	answer: "",
	tokens: { total: 0, prompt: 0, completion: 0 },
	cost: { total: 0, prompt: 0, completion: 0 },
	response_time_ms: 0,
	status: "success",
};

// Interface for Data
interface PlaygroundData {
	inputContent: string;
	outputContent: PromptResponse | null;
	clearedOutput: PromptResponse | null;
	expectedOutput: PromptResponse | null;

	isTestcaseLoaded: boolean;
	wasRun: boolean;
	runLoading: boolean;
	isAuditLoading: boolean;
	isUpdatingPromptContent: boolean;
	isFormattingUpdate: boolean;
	isUncommitted: boolean;

	modalOpen: boolean;
	showAuditModal: boolean;
	diffModalInfo: { prompt: string } | null;

	status: string;
	currentExpectedThoughts: string;
	originalPromptContent: string;
	livePromptValue: string;

	currentAuditData: AuditData | null;
	isPromptChangedAfterAudit: boolean;

	hasPromptContent: boolean;
	hasInputContent: boolean;

	currentAssertionType: string;

	assertionValue: string;
	selectedMemoryId: string;
	selectedMemoryKeyName: string;
	persistedMemoryId: string;
	testcaseStatusCounts: {
		ok: number;
		nok: number;
		needRun: number;
	};
}

// Interface for Actions
interface PlaygroundActions {
	setFlags: (flags: Partial<PlaygroundData>) => void;
	setInputContent: (inputContent: string) => void;
	setOutputContent: (outputContent: PromptResponse | null) => void;
	setExpectedOutput: (outputContent: PromptResponse | null) => void;
	setCurrentExpectedThoughts: (thoughts: string) => void;
	setCurrentAssertionType: (type: string) => void;
	setOriginalPromptContent: (content: string) => void;
	setLivePromptValue: (value: string) => void;
	setCurrentAuditData: (data: AuditData | null) => void;
	setDiffModalInfo: (info: { prompt: string } | null) => void;
	setAssertionValue: (value: string) => void;
	setSelectedMemoryId: (id: string) => void;
	setSelectedMemoryKeyName: (name: string) => void;
	setPersistedMemoryId: (id: string) => void;
	setTestcaseStatusCounts: (counts: { ok: number; nok: number; needRun: number }) => void;

	clearOutput: () => void;
	resetForNewTestcase: () => void;
	resetOutput: () => void;
	clearAllState: () => void;
}

// Combined State Interface
type PlaygroundState = PlaygroundData & PlaygroundActions;

const initialState: PlaygroundData = {
	inputContent: "",
	outputContent: null,
	clearedOutput: null,
	expectedOutput: null,

	isTestcaseLoaded: false,
	wasRun: false,
	runLoading: false,
	isAuditLoading: false,
	isUpdatingPromptContent: false,
	isFormattingUpdate: false,
	isUncommitted: false,

	modalOpen: false,
	showAuditModal: false,
	diffModalInfo: null,

	status: "",
	currentExpectedThoughts: "",
	originalPromptContent: "",
	livePromptValue: "",

	currentAuditData: null,
	isPromptChangedAfterAudit: false,

	hasPromptContent: false,
	hasInputContent: false,

	currentAssertionType: "AI",

	assertionValue: "",
	selectedMemoryId: "",
	selectedMemoryKeyName: "",
	persistedMemoryId: "",
	testcaseStatusCounts: {
		ok: 0,
		nok: 0,
		needRun: 0,
	},
};

// Store creation
const usePlaygroundStore = createWithEqualityFn<PlaygroundState>()(
	devtools(
		(set, get) => ({
			...initialState,

			// Actions
			setFlags: (flags) => {
				return set((state) => ({ ...state, ...flags }), false, "setFlags");
			},

			setInputContent: (inputContent) => {
				return set(
					{ inputContent, hasInputContent: !!inputContent?.trim() },
					false,
					"setInputContent",
				);
			},
			setOutputContent: (outputContent) => {
				return set({ outputContent }, false, "setOutputContent");
			},
			setExpectedOutput: (expectedOutput) => {
				return set({ expectedOutput }, false, "setExpectedOutput");
			},
			setCurrentExpectedThoughts: (currentExpectedThoughts) => {
				return set({ currentExpectedThoughts }, false, "setCurrentExpectedThoughts");
			},
			setCurrentAssertionType: (currentAssertionType) => {
				return set({ currentAssertionType }, false, "setCurrentAssertionType");
			},
			setOriginalPromptContent: (originalPromptContent) => {
				return set(
					{
						originalPromptContent,
						livePromptValue: originalPromptContent,
						isUncommitted: true,
						hasPromptContent: !!originalPromptContent?.trim(),
					},
					false,
					"setOriginalPromptContent",
				);
			},
			setLivePromptValue: (livePromptValue) => {
				return set({ livePromptValue }, false, "setLivePromptValue");
			},
			setCurrentAuditData: (currentAuditData) => {
				return set({ currentAuditData }, false, "setCurrentAuditData");
			},
			setDiffModalInfo: (diffModalInfo) => {
				return set({ diffModalInfo }, false, "setDiffModalInfo");
			},
			setAssertionValue: (assertionValue) => {
				return set({ assertionValue }, false, "setAssertionValue");
			},
			setSelectedMemoryId: (selectedMemoryId) => {
				return set({ selectedMemoryId }, false, "setSelectedMemoryId");
			},
			setSelectedMemoryKeyName: (selectedMemoryKeyName) => {
				return set({ selectedMemoryKeyName }, false, "setSelectedMemoryKeyName");
			},
			setPersistedMemoryId: (persistedMemoryId) => {
				return set({ persistedMemoryId }, false, "setPersistedMemoryId");
			},
			setTestcaseStatusCounts: (counts) => {
				return set({ testcaseStatusCounts: counts }, false, "setTestcaseStatusCounts");
			},

			clearOutput: () => {
				return set({ outputContent: null, clearedOutput: null }, false, "clearOutput");
			},

			resetForNewTestcase: () => {
				return set(
					{
						inputContent: "",
						currentExpectedThoughts: "",
						clearedOutput: null,
						isTestcaseLoaded: false,
						modalOpen: false,
						status: "",
						outputContent: null,
						expectedOutput: null,
						hasInputContent: false,
					},
					false,
					"resetForNewTestcase",
				);
			},

			resetOutput: () => {
				return set(
					{
						outputContent: null,
						expectedOutput: null,
						currentExpectedThoughts: "",
						clearedOutput: null,
					},
					false,
					"resetOutput",
				);
			},

			clearAllState: () => {
				return set(
					{
						inputContent: "",
						outputContent: null,
						clearedOutput: null,
						expectedOutput: null,
						currentExpectedThoughts: "",
						originalPromptContent: "",
						livePromptValue: "",
						isTestcaseLoaded: false,
						modalOpen: false,
						status: "",
						hasPromptContent: false,
						hasInputContent: false,
						selectedMemoryId: "",
						selectedMemoryKeyName: "",
						persistedMemoryId: "",
					},
					false,
					"clearAllState",
				);
			},
		}),
		{ name: "playground-store", enabled: true },
	),
);

// Grouped Selectors
export const usePlaygroundUI = () =>
	usePlaygroundStore(
		(state) => ({
			modalOpen: state.modalOpen,
			showAuditModal: state.showAuditModal,
			diffModalInfo: state.diffModalInfo,
			isTestcaseLoaded: state.isTestcaseLoaded,
			wasRun: state.wasRun,
			runLoading: state.runLoading,
			isAuditLoading: state.isAuditLoading,
			isUpdatingPromptContent: state.isUpdatingPromptContent,
			status: state.status,
		}),
		shallow,
	);

export const usePlaygroundContent = () =>
	usePlaygroundStore(
		(state) => ({
			inputContent: state.inputContent,
			outputContent: state.outputContent,
			clearedOutput: state.clearedOutput,
			expectedOutput: state.expectedOutput,
			currentExpectedThoughts: state.currentExpectedThoughts,
			originalPromptContent: state.originalPromptContent,
			livePromptValue: state.livePromptValue,
			hasPromptContent: state.hasPromptContent,
			hasInputContent: state.hasInputContent,
		}),
		shallow,
	);

export const usePlaygroundAudit = () =>
	usePlaygroundStore(
		(state) => ({
			currentAuditData: state.currentAuditData,
			isAuditLoading: state.isAuditLoading,
			isPromptChangedAfterAudit: state.isPromptChangedAfterAudit,
		}),
		shallow,
	);

export const usePlaygroundTestcase = () =>
	usePlaygroundStore(
		(state) => ({
			currentAssertionType: state.currentAssertionType,
			isTestcaseLoaded: state.isTestcaseLoaded,
			assertionValue: state.assertionValue,
			selectedMemoryId: state.selectedMemoryId,
			selectedMemoryKeyName: state.selectedMemoryKeyName,
			persistedMemoryId: state.persistedMemoryId,
			testcaseStatusCounts: state.testcaseStatusCounts,
		}),
		shallow,
	);

export const usePlaygroundActions = () =>
	usePlaygroundStore(
		(state) => ({
			setFlags: state.setFlags,
			setInputContent: state.setInputContent,
			setOutputContent: state.setOutputContent,
			setExpectedOutput: state.setExpectedOutput,
			setCurrentExpectedThoughts: state.setCurrentExpectedThoughts,
			setCurrentAssertionType: state.setCurrentAssertionType,
			setOriginalPromptContent: state.setOriginalPromptContent,
			setLivePromptValue: state.setLivePromptValue,
			setCurrentAuditData: state.setCurrentAuditData,
			setDiffModalInfo: state.setDiffModalInfo,
			setAssertionValue: state.setAssertionValue,
			setSelectedMemoryId: state.setSelectedMemoryId,
			setSelectedMemoryKeyName: state.setSelectedMemoryKeyName,
			setPersistedMemoryId: state.setPersistedMemoryId,
			setTestcaseStatusCounts: state.setTestcaseStatusCounts,
			clearOutput: state.clearOutput,
			resetForNewTestcase: state.resetForNewTestcase,
			resetOutput: state.resetOutput,
			clearAllState: state.clearAllState,
		}),
		shallow,
	);

export default usePlaygroundStore;
