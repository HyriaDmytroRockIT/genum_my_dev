import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Options, usePromptById } from "@/hooks/usePrompt";
import TextEditor from "@/pages/prompt/playground-tabs/playground-layout/prompt-editor/TextEditor";
import OutputBlock, {
	UpdateExpected,
} from "@/pages/prompt/playground-tabs/playground-layout/outputs/Output";
import { useToast } from "@/hooks/useToast";
import { AuditData } from "@/types/audit";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRunPrompt, PromptResponse } from "@/hooks/useRunPrompt";
import { Button } from "@/components/ui/button";
import SettingsBar from "@/pages/prompt/playground-tabs/playground-layout/settings-block/SettingsBar";
import { Loader2 } from "lucide-react";
import useQueryWithAuth from "@/hooks/useQueryWithAuth";
import { TestcaseAssertionModal } from "@/components/dialogs/TestcaseAssertionDialog";
import { Model } from "@/types/AIModel";
import useMutationWithAuth from "@/hooks/useMutationWithAuth";
import { TestCaseResponse } from "@/types/TestСase";
import useAuditDataModal from "@/hooks/useAuditDataModal";
import AuditResultsModal from "@/components/dialogs/AuditResultsDialog";
import PromptDiff from "@/components/dialogs/PromptDiffDialog";
import { InputTextArea } from "@/pages/prompt/playground-tabs/playground-layout/InputTextArea";
import { useSidebar } from "@/components/sidebar/sidebar";
import clsx from "clsx";
import { useMemory } from "@/contexts/MemoryContext";
import { usePromptStatus } from "@/contexts/PromptStatusContext";
import {
	usePlaygroundContent,
	usePlaygroundActions,
	usePlaygroundTestcase,
	usePlaygroundUI,
	defaultPromptResponse,
} from "@/stores/playground.store";
import usePlaygroundStore from "@/stores/playground.store";
import { useTestcaseStatusCounts } from "@/hooks/useTestcaseStatusCounts";
import { promptApi } from "@/api/prompt";
import { testcasesApi } from "@/api/testcases/testcases.api";

const formatTestcaseOutput = (output: any): PromptResponse => {
	if (!output) {
		return defaultPromptResponse;
	}

	if (typeof output === "object" && "answer" in output) {
		const result = {
			...output,
			answer: output.answer ?? "",
		};
		return result;
	}

	if (typeof output === "string") {
		return {
			answer: output,
			tokens: defaultPromptResponse.tokens,
			cost: defaultPromptResponse.cost,
			response_time_ms: defaultPromptResponse.response_time_ms,
			status: defaultPromptResponse.status,
		};
	}

	if (typeof output === "object") {
		return {
			answer: output.toString() || "",
			tokens: output.tokens || defaultPromptResponse.tokens,
			cost: output.cost || defaultPromptResponse.cost,
			response_time_ms: output.response_time_ms || defaultPromptResponse.response_time_ms,
			status: output.status || defaultPromptResponse.status,
		};
	}

	return defaultPromptResponse;
};

export default function Playground() {
	const {
		setFlags,
		setOutputContent,
		setExpectedOutput,
		setCurrentExpectedThoughts,
		setCurrentAssertionType,
		resetForNewTestcase,
		clearAllState,
		setSelectedMemoryId,
		setSelectedMemoryKeyName,
		setPersistedMemoryId,
	} = usePlaygroundActions();
	const {
		outputContent: storeOutputContent,
		clearedOutput,
		currentExpectedThoughts,
	} = usePlaygroundContent();
	const { currentAssertionType } = usePlaygroundTestcase();
	const { modalOpen, status, wasRun, isTestcaseLoaded } = usePlaygroundUI();
	const { currentMemoryKey, setCurrentMemoryKey } = useMemory();
	const get = usePlaygroundStore.getState;

	const [, setIsUncommitted] = useState(false);
	const [isAuditLoading, setIsAuditLoading] = useState(false);
	const [currentAuditData, setCurrentAuditData] = useState<AuditData | null>(null);
	const [isPromptChangedAfterAudit, setIsPromptChangedAfterAudit] = useState(false);
	const clearExpectedOutputRef = useRef<(() => void) | null>(null);
	const lastSavedInputRef = useRef<string>("");

	const [diffModalInfo, setDiffModalInfo] = useState<{
		prompt: string;
	} | null>(null);
	const [showAuditModal, setShowAuditModal] = useState(false);
	const markAsUncommittedRef = useRef<(() => void) | null>(null);

	const { inputContent, hasInputContent, hasPromptContent } = usePlaygroundContent();
	const { setOriginalPromptContent, setInputContent } = usePlaygroundActions();

	const { setIsCommitted, setActivePromptId } = usePromptStatus();
	const [isFormattingUpdate, setIsFormattingUpdate] = useState(false);

	const { orgId, projectId, id } = useParams<{
		orgId: string;
		projectId: string;
		id: string;
	}>();
	const promptId = id ? Number(id) : undefined;
	const { toast } = useToast();
	const [searchParams] = useSearchParams();
	const testcaseId = searchParams.get("testcaseId");
	const queryClient = useQueryClient();
	const { getAccessTokenSilently } = useAuth();
	const { setAuditDataModal } = useAuditDataModal();
	const navigate = useNavigate();

	useTestcaseStatusCounts(promptId);

	const prevTestcaseIdRef = useRef<string | null>(testcaseId);

	useEffect(() => {
		return () => {
			clearAllState();
			setCurrentMemoryKey("");
			setFlags({ clearedOutput: null });
		};
	}, [clearAllState, setCurrentMemoryKey, setFlags]);

	useEffect(() => {
		setActivePromptId(promptId);
		return () => setActivePromptId(undefined);
	}, [promptId, setActivePromptId]);

	const {
		updatePromptName,
		prompt,
		loading: promptLoading,
		error: updatePromptError,
	} = usePromptById(promptId);

	useEffect(() => {
		if (prompt?.prompt?.assertionType) {
			setCurrentAssertionType(prompt.prompt.assertionType);
		}
	}, [prompt?.prompt?.assertionType]);

	const modelsQuery = useQueryWithAuth<{ models: Model[] }>({
		keys: ["prompts", "models"],
		queryFn: async () => {
			return await promptApi.getModels();
		},
		onError: (err) => {},
	});

	const memoriesQuery = useQueryWithAuth({
		keys: ["memoriesForPromt", String(promptId || "none")],
		enabled: !!promptId,
		queryFn: async () => {
			if (!promptId) throw new Error("Prompt ID is required");
			return await promptApi.getMemories(promptId);
		},
	});

	const { runPrompt, result: outputContent, loading: runLoading } = useRunPrompt();

	useEffect(() => {
		if (outputContent && outputContent.answer !== undefined && outputContent.answer !== null) {
			setOutputContent(outputContent);
		}
	}, [outputContent, setOutputContent, testcaseId, get]);

	const {
		data: testcaseData,
		isLoading: testcaseQueryIsLoading,
		refetch: refetchTestcase,
	} = useQueryWithAuth<TestCaseResponse>({
		url: testcaseId ? `/testcases/${testcaseId}` : "/testcases/null",
		keys: ["testcaseById", testcaseId || "null"],
		enabled: !!testcaseId,
		options: {
			gcTime: 0,
			staleTime: 0,
		},
	});
	const { mutation: saveAsExpectedMutation } = useMutationWithAuth<TestCaseResponse>();
	const testcase = testcaseData?.testcase || null;

	useEffect(() => {
		const prevTestcaseId = prevTestcaseIdRef.current;
		const currentTestcaseId = testcaseId;

		if (prevTestcaseId && (!currentTestcaseId || prevTestcaseId !== currentTestcaseId)) {
			resetForNewTestcase();
			setCurrentMemoryKey("");
			setPersistedMemoryId("");
			setSelectedMemoryId("");
			setSelectedMemoryKeyName("");
		}

		prevTestcaseIdRef.current = currentTestcaseId;
	}, [
		testcaseId,
		resetForNewTestcase,
		setCurrentMemoryKey,
		setPersistedMemoryId,
		setSelectedMemoryId,
		setSelectedMemoryKeyName,
	]);

	useEffect(() => {
		if (testcase) {
			const testcaseInput = testcase.input || "";
			setInputContent(testcaseInput);
			lastSavedInputRef.current = testcaseInput;
			setExpectedOutput(formatTestcaseOutput(testcase.expectedOutput));

			const formattedLastOutput = formatTestcaseOutput(testcase.lastOutput);

			if (
				formattedLastOutput &&
				formattedLastOutput.answer !== undefined &&
				formattedLastOutput.answer !== null
			) {
				const { outputContent } = get();

				const isSameAnswer = outputContent?.answer === formattedLastOutput.answer;
				const hasMetrics =
					(outputContent?.tokens?.total ?? 0) > 0 ||
					(outputContent?.response_time_ms ?? 0) > 0;

				if (!isSameAnswer || !hasMetrics) {
					setOutputContent(formattedLastOutput);
				}
			}

			setCurrentExpectedThoughts(testcase.expectedChainOfThoughts || "");
			setFlags({ isTestcaseLoaded: true });
		} else if (!testcaseId) {
			setExpectedOutput(null);
		}
	}, [
		testcase,
		testcaseId,
		get,
		setInputContent,
		setExpectedOutput,
		setOutputContent,
		setCurrentExpectedThoughts,
		setFlags,
	]);

	const prevTestcaseMemoryIdRef = useRef<number | null | undefined>(undefined);
	const prevTestcaseIdForMemoryRef = useRef<string | null>(null);

	const { persistedMemoryId, selectedMemoryId } = usePlaygroundTestcase();

	useEffect(() => {
		if (testcase) {
			const testcaseMemoryId = testcase.memoryId;
			const prevMemoryId = prevTestcaseMemoryIdRef.current;
			const prevTestcaseId = prevTestcaseIdForMemoryRef.current;
			const currentTestcaseId = testcaseId;

			const isNewTestcase = prevTestcaseId !== currentTestcaseId;

			if (testcaseMemoryId) {
				const memoryIdString = String(testcaseMemoryId);

				if (persistedMemoryId !== memoryIdString) {
					if (memoriesQuery.data?.memories) {
						const memory = memoriesQuery.data.memories.find(
							(item: any) => item.id === testcaseMemoryId,
						);

						if (memory) {
							setPersistedMemoryId(memoryIdString);
							setSelectedMemoryId(memoryIdString);
							setSelectedMemoryKeyName(memory.key);
							setCurrentMemoryKey(memoryIdString);
							prevTestcaseMemoryIdRef.current = testcaseMemoryId;
						}
					} else {
						// Don't update prevMemoryId yet - wait for memories to load
						return;
					}
				} else {
					prevTestcaseMemoryIdRef.current = testcaseMemoryId;
				}
			} else if (!testcaseMemoryId) {
				if (isNewTestcase || (prevMemoryId !== undefined && prevMemoryId !== null)) {
					if (persistedMemoryId || selectedMemoryId) {
						setPersistedMemoryId("");
						setSelectedMemoryId("");
						setSelectedMemoryKeyName("");
						setCurrentMemoryKey("");
					}
				}
				prevTestcaseMemoryIdRef.current = testcaseMemoryId;
			}

			prevTestcaseIdForMemoryRef.current = currentTestcaseId;
		}
	}, [
		testcase?.memoryId,
		testcaseId,
		memoriesQuery.data?.memories,
		persistedMemoryId,
		selectedMemoryId,
		setPersistedMemoryId,
		setSelectedMemoryId,
		setSelectedMemoryKeyName,
		setCurrentMemoryKey,
	]);

	useEffect(() => {
		if (prompt?.prompt) {
			const promptCommitted = prompt.prompt.commited || false;
			setIsCommitted(promptCommitted);

			if (!isFormattingUpdate) {
				setIsUncommitted(!promptCommitted);
			}
		}
	}, [prompt?.prompt?.commited, prompt?.prompt?.updatedAt, isFormattingUpdate, setIsCommitted]);

	const auditPrompt = async () => {
		if (!promptId || !prompt?.prompt?.value || isAuditLoading) return;

		setIsAuditLoading(true);
		try {
			const data = await promptApi.auditPrompt(promptId);

			if (data && data.audit) {
				setCurrentAuditData(data.audit);
				setIsPromptChangedAfterAudit(false);
				setAuditDataModal(data.audit);
				setShowAuditModal(true);
			}
		} catch (error) {
			toast({
				title: "Audit failed",
				description: "Failed to audit the prompt. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsAuditLoading(false);
		}
	};

	const handleOpenAuditModal = () => {
		setShowAuditModal(true);
	};

	const handleCloseAuditModal = () => {
		setShowAuditModal(false);
	};

	const handleAuditComplete = useCallback(
		(auditData: AuditData) => {
			setCurrentAuditData(auditData);
			setIsPromptChangedAfterAudit(false);
			if (promptId) {
				queryClient.setQueryData(["prompt", promptId], (oldData: any) => {
					if (!oldData) return oldData;
					return {
						...oldData,
						prompt: {
							...oldData.prompt,
							audit: {
								data: auditData,
							},
						},
					};
				});
			}
		},
		[promptId, queryClient],
	);

	const handleTestcaseAdded = useCallback(async () => {
		resetForNewTestcase();
		setInputContent("");

		try {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: ["prompt", promptId],
				}),
				queryClient.invalidateQueries({
					queryKey: ["testcasesForPromt", String(promptId)],
				}),
			]);
		} catch (error) {
			console.error("Error invalidating queries after adding testcase:", error);
		}
	}, [queryClient, promptId, resetForNewTestcase, setInputContent]);

	const markAsUncommitted = useCallback(() => {}, []);

	const handleMarkAsUncommittedCallback = useCallback((callback: () => void) => {
		markAsUncommittedRef.current = callback;
	}, []);

	useEffect(() => {
		markAsUncommittedRef.current = markAsUncommitted;
	}, [markAsUncommitted]);

	const isContentChangeSignificant = (oldContent: string, newContent: string): boolean => {
		const normalize = (str: string) =>
			str
				.replace(/\s+/g, " ")
				.replace(/[""]/g, '"')
				.replace(/['']/g, "'")
				.trim()
				.toLowerCase();

		const normalizedOld = normalize(oldContent);
		const normalizedNew = normalize(newContent);

		const lengthDiff = Math.abs(normalizedOld.length - normalizedNew.length);

		return normalizedOld !== normalizedNew && lengthDiff > 5;
	};

	const [isUpdatingPromptContent, setIsUpdatingPromptContent] = useState(false);

	const prevPromptIdRef = useRef<number | undefined>(promptId);

	useEffect(() => {
		const prevPromptId = prevPromptIdRef.current;
		const currentPromptId = promptId;

		if (prevPromptId !== undefined && prevPromptId !== currentPromptId) {
			clearAllState();
			setActivePromptId(currentPromptId);
		}

		prevPromptIdRef.current = currentPromptId;
	}, [promptId, clearAllState, setActivePromptId]);

	useEffect(() => {
		const currentContent = prompt?.prompt?.value || "";
		const isCommited = prompt?.prompt?.commited;

		if (!isUpdatingPromptContent) {
			setOriginalPromptContent(currentContent);
		}
	}, [
		prompt?.prompt?.value,
		prompt?.prompt?.commited,
		isUpdatingPromptContent,
		setOriginalPromptContent,
	]);

	const updatePromptContent = useCallback(
		async (
			value: string,
			options?: { isEmpty?: boolean; isFormattingOnly?: boolean } & Options,
		) => {
			try {
				setIsUpdatingPromptContent(true);

				if (isUpdatingPromptContent) {
					return;
				}

				if (options?.isWithoutUpdate) {
					setIsUncommitted(true);
					return;
				}

				const currentPromptValue = prompt?.prompt?.value || "";
				const isSignificantChange = options?.isFormattingOnly
					? false
					: isContentChangeSignificant(currentPromptValue, value);

				if (options?.isFormattingOnly) {
					setIsFormattingUpdate(true);
				}

				const updateValue = options?.isEmpty ? "" : value;

				if (updateValue !== currentPromptValue) {
					setIsCommitted(false);

					await updatePromptName({ value: updateValue }, options as Options);

					if (isSignificantChange || options?.isEmpty) {
					}
				}

				if (options?.isFormattingOnly) {
					setIsFormattingUpdate(false);
				}
			} catch (error) {
			} finally {
				setIsUpdatingPromptContent(false);
			}
		},
		[
			updatePromptName,
			queryClient,
			promptId,
			isUpdatingPromptContent,
			prompt?.prompt?.value,
			isContentChangeSignificant,
			setIsCommitted,
		],
	);

	const handleDiffSave = useCallback(
		(value: string) => {
			if (value) {
				updatePromptContent(value, {
					isWithoutUpdate: false,
					isFormattingOnly: false,
				});
				setCurrentAuditData(null);
				setIsPromptChangedAfterAudit(true);

				if (promptId) {
					queryClient.setQueryData(["prompt", promptId], (oldData: any) => {
						if (!oldData) return oldData;
						return {
							...oldData,
							prompt: {
								...oldData.prompt,
								audit: undefined,
							},
						};
					});
				}
			}
			setDiffModalInfo(null);
		},
		[updatePromptContent, promptId, queryClient],
	);

	const handleSaveAsExpected = useCallback(
		async (newExpectedContent: UpdateExpected) => {
			// Update store with expected output even in prompt mode (without testcaseId)
			const expectedOutputData = {
				answer: newExpectedContent.answer,
				tokens: storeOutputContent?.tokens || defaultPromptResponse.tokens,
				cost: storeOutputContent?.cost || defaultPromptResponse.cost,
				response_time_ms:
					storeOutputContent?.response_time_ms || defaultPromptResponse.response_time_ms,
				status: storeOutputContent?.status || defaultPromptResponse.status,
			};
			setExpectedOutput(expectedOutputData);

			if (!testcaseId) {
				return;
			}

			try {
				const updateData = {
					expectedOutput: newExpectedContent.answer,
					expectedChainOfThoughts: currentExpectedThoughts || "",
				};

				await saveAsExpectedMutation.mutateAsync({
					url: `/testcases/${testcaseId}`,
					method: "PUT",
					data: updateData,
				});

				queryClient.setQueryData(["testcaseById", testcaseId], (oldData: any) => {
					if (!oldData) {
						return oldData;
					}

					const updatedTestcase = {
						...oldData.testcase,
						expectedOutput: newExpectedContent.answer,
						expectedChainOfThoughts: currentExpectedThoughts || "",
					};

					return {
						...oldData,
						testcase: updatedTestcase,
					};
				});

				setTimeout(() => {
					queryClient.invalidateQueries({
						queryKey: ["testcaseById", testcaseId],
					});
				}, 100);
			} catch (error) {}
		},
		[
			testcaseId,
			saveAsExpectedMutation,
			queryClient,
			setExpectedOutput,
			storeOutputContent,
			currentExpectedThoughts,
		],
	);

	const inputRef = useRef<HTMLTextAreaElement>(null);

	const handlePromptUpdate = useCallback(
		async (newPrompt: string) => {
			await updatePromptContent(newPrompt);

			if (updatePromptError) {
				toast({
					title: "Update failed",
					description: "Failed to update system instructions.",
					variant: "destructive",
				});
			} else {
				toast({
					title: "Prompt updated",
					description: "System instructions have been updated successfully.",
				});
			}
		},
		[updatePromptContent, toast],
	);

	useEffect(() => {
		if (!outputContent || !testcaseId || !testcase || !wasRun) {
			return;
		}

		setFlags({ status: outputContent.status });
		const assertionType = currentAssertionType || prompt?.prompt?.assertionType;
		if (assertionType === "AI" || assertionType === "STRICT") {
			setFlags({ modalOpen: true });
		}

		const fetchLatestPromptData = async () => {
			try {
				if (!promptId) return;
				const data = await promptApi.getPrompt(promptId);
				if (data.prompt?.testcaseStatuses) {
					window.dispatchEvent(
						new CustomEvent("testcaseStatusUpdated", {
							detail: {
								promptId,
								testcaseStatuses: data.prompt.testcaseStatuses,
							},
						}),
					);
				}
			} catch (error) {}
		};

		setTimeout(fetchLatestPromptData, 500);
		setFlags({ wasRun: false });
	}, [outputContent, testcaseId, testcase, wasRun, prompt, currentAssertionType, promptId]);

	const handleRegisterClearFunction = useCallback((clearFn: () => void) => {
		clearExpectedOutputRef.current = clearFn;
	}, []);

	const handleInputBlur = useCallback(async () => {
		if (!testcaseId) return;

		if (inputContent !== lastSavedInputRef.current) {
			try {
				await testcasesApi.updateTestcase(testcaseId, { input: inputContent });

				lastSavedInputRef.current = inputContent;

				queryClient.setQueryData(["testcaseById", testcaseId], (oldData: any) => {
					if (!oldData) return oldData;

					return {
						...oldData,
						testcase: {
							...oldData.testcase,
							input: inputContent,
						},
					};
				});
			} catch (error) {
				console.error("Failed to update testcase input:", error);
			}
		}
	}, [testcaseId, inputContent, queryClient]);

	const handleRun = async () => {
		if (!promptId) return;

		setFlags({ clearedOutput: null });

		try {
			const runParams = {
				question: inputContent,
				...(currentMemoryKey && { memoryId: Number(currentMemoryKey) }),
			};

			if (!testcaseId) {
				await runPrompt(promptId, runParams);
				return;
			}

			const result = await runPrompt(promptId, runParams, testcaseId);

			if (result) {
				setOutputContent(result);
				setFlags({ wasRun: true });

				await refetchTestcase();
				await queryClient.invalidateQueries({
					queryKey: ["testcasesForPromt", String(promptId)],
				});

				window.dispatchEvent(new CustomEvent("testcaseUpdated"));
			}
		} catch (error) {
			if (testcaseId) {
				await refetchTestcase();
			}
		}
	};

	const currentOutput = clearedOutput || storeOutputContent;
	const expectedContent = formatTestcaseOutput(testcase?.expectedOutput);

	const currentTokens = currentOutput?.tokens || defaultPromptResponse.tokens;
	const currentCost = currentOutput?.cost || defaultPromptResponse.cost;
	const currentResponseTime = currentOutput?.response_time_ms || null;

	const currentAuditRate = isPromptChangedAfterAudit
		? undefined
		: (currentAuditData?.rate ?? prompt?.prompt?.audit?.data?.rate);

	const sidebar = useSidebar();

	useEffect(() => {
		if (
			updatePromptError &&
			updatePromptError.includes("Prompt is not found") &&
			orgId &&
			projectId
		) {
			navigate(`/${orgId}/${projectId}/prompts`, { replace: true });
		}
	}, [updatePromptError, orgId, projectId, navigate]);

	return (
		<div className="h-full flex flex-grow-0 max-w-[1470px] ml-3 mr-3 lg:mr-6 w-full text-foreground">
			<div className="flex flex-col lg:flex-row w-full h-full items-start">
				<div className="flex w-full flex-col bg-card text-card-foreground border border-border rounded-[12px] mt-0 pt-3 pb-4 px-4 gap-8">
					{testcaseId && !isTestcaseLoaded && testcaseQueryIsLoading ? (
						<div className="flex items-center justify-center h-full">
							<Loader2 className="animate-spin" />
							<span className="ml-2">Loading testcase...</span>
						</div>
					) : (
						<>
							<TextEditor
								isPromptInstructionsEditor
								title="System Instructions"
								main={true}
								onUpdatePrompt={updatePromptContent}
								tokens={currentTokens}
								cost={currentCost}
								responseTime={currentResponseTime}
								testcaseInput={testcase?.input}
								expectedContent={expectedContent}
								onAuditPrompt={auditPrompt}
								onOpenAuditModal={handleOpenAuditModal}
								isAuditLoading={isAuditLoading}
								canAudit={!!prompt?.prompt?.value}
								auditRate={currentAuditRate}
							/>

							<div>
								<InputTextArea
									ref={inputRef}
									onBlur={handleInputBlur}
									promptId={promptId}
									systemPrompt={prompt?.prompt?.value}
								/>

								<div className="flex flex-col gap-2 mt-3">
									<div className="flex justify-end">
										<Button
											disabled={
												!hasPromptContent ||
												!hasInputContent ||
												promptLoading ||
												runLoading
											}
											onClick={handleRun}
											className="text-[14px] h-[32px] w-[138px]"
										>
											{runLoading && <Loader2 className="animate-spin" />}
											{testcaseId ? "Run testcase" : "Run prompt"}
										</Button>
									</div>
								</div>
							</div>

							<OutputBlock
								key={testcaseId}
								promptName={prompt?.prompt?.name || ""}
								onSaveAsExpected={handleSaveAsExpected}
								systemPrompt={prompt?.prompt?.value}
								onPromptUpdate={handlePromptUpdate}
								onTestcaseAdded={handleTestcaseAdded}
								onRegisterClearFunction={handleRegisterClearFunction}
							/>
						</>
					)}
				</div>

				<div
					className={clsx(
						"w-full transition-all md:w-[322px] md:min-w-[322px] 2xl-plus:w-[400px] 2xl-plus:min-w-[400px] lg:pt-0 lg:pl-6",
						{ "xl:min-w-[400px]": !sidebar.open },
					)}
				>
					<SettingsBar
						prompt={prompt?.prompt}
						models={modelsQuery.data?.models}
						tokens={currentTokens}
						cost={currentCost}
						responseTime={currentResponseTime}
						updatePromptContent={updatePromptContent}
						onMarkAsUncommittedCallback={handleMarkAsUncommittedCallback}
						isUpdatingPromptContent={isUpdatingPromptContent}
					/>
				</div>
			</div>

			{testcase && (
				<TestcaseAssertionModal
					open={modalOpen}
					onClose={() => setFlags({ modalOpen: false })}
					// @ts-ignore
					testcase={testcase}
					status={status}
				/>
			)}

			<AuditResultsModal
				promptId={promptId || ""}
				promptValue={prompt?.prompt?.value || ""}
				existingAuditData={currentAuditData || prompt?.prompt?.audit?.data}
				isOpen={showAuditModal}
				onClose={handleCloseAuditModal}
				onAuditComplete={handleAuditComplete}
				isDisabledFix={false}
				setDiffModalInfo={setDiffModalInfo}
			/>

			{diffModalInfo && (
				<PromptDiff
					isOpen={!!diffModalInfo}
					onOpenChange={(open) => !open && setDiffModalInfo(null)}
					original={prompt?.prompt?.value || ""}
					modified={diffModalInfo.prompt}
					isLoading={false}
					onSave={handleDiffSave}
				/>
			)}
		</div>
	);
}
