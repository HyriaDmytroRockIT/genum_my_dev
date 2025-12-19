import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { MemoryTypes } from "@/hooks/useMemoryColumns";
import useQueryWithAuth from "@/hooks/useQueryWithAuth";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/useToast";
import { useSearchParams } from "react-router-dom";
import CreateMemoryDialog from "@/components/dialogs/CreateMemoryDialog";
import { PlusCircle, Inbox, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { promptApi } from "@/api/prompt";
import { apiClient } from "@/api/client";

interface MemoryKeyProps {
	promptId: number;
	onMemoryKeyChange?: (memoryKey: string) => void;
	selectedMemoryId?: string;
}

const MemoryKey = ({
	promptId,
	onMemoryKeyChange,
	selectedMemoryId: externalSelectedMemoryId = "",
}: MemoryKeyProps) => {
	const [selectedKey, setSelectedKey] = useState(externalSelectedMemoryId);
	const [memoryValue, setMemoryValue] = useState("");
	const [createMemoryModalOpen, setCreateMemoryModalOpen] = useState(false);
	const [showClearIcon, setShowClearIcon] = useState(false);
	const [isManuallyCleared, setIsManuallyCleared] = useState(false);
	const originalValueRef = useRef("");
	const isUpdatingRef = useRef(false);
	const isInitializedRef = useRef(false);
	const selectedKeyRef = useRef(selectedKey);
	const lastNotifiedKeyRef = useRef<string | null>(null);

	useEffect(() => {
		selectedKeyRef.current = selectedKey;
	}, [selectedKey]);

	const [searchParams] = useSearchParams();
	const testcaseId = searchParams.get("testcaseId");

	const { data, refetch } = useQueryWithAuth({
		keys: ["memoriesForPromt", String(promptId)],
		queryFn: async () => {
			return await promptApi.getMemories(promptId);
		},
	});

	const { data: testcase, refetch: refetchTestcase } = useQueryWithAuth({
		url: `/testcases/${testcaseId}`,
		keys: testcaseId ? ["testcaseById", testcaseId] : ["testcaseById"],
		enabled: Boolean(testcaseId),
	});

	const updateMemoryMutation = useMutation({
		mutationFn: async ({ memoryId, value }: { memoryId: number; value: string }) => {
			return await promptApi.updateMemory(promptId, memoryId, { value });
		},
		onSuccess: () => {
			refetch();
		},
		onError: () => {
			toast({
				title: "Something went wrong",
				variant: "destructive",
			});
		},
	});

	const createMemoryMutation = useMutation({
		mutationFn: async ({ key, value }: { key: string; value: string }) => {
			return await promptApi.createMemory(promptId, { key, value });
		},
	});

	const updateTestcaseMutation = useMutation({
		mutationFn: async ({
			testcaseId,
			memoryId,
		}: {
			testcaseId: string;
			memoryId: number | null;
		}) => {
			// TODO: Move to testcase API when created
			return await apiClient.put(`/testcases/${testcaseId}`, { memoryId });
		},
	});

	const prevPromptIdRef = useRef<number | undefined>(promptId);
	const prevTestcaseIdRef = useRef<string | null>(testcaseId);

	// Reset when prompt changes
	useEffect(() => {
		const prevPromptId = prevPromptIdRef.current;
		const currentPromptId = promptId;

		if (prevPromptId !== undefined && prevPromptId !== currentPromptId) {
			setSelectedKey("");
			setMemoryValue("");
			originalValueRef.current = "";
			setIsManuallyCleared(false);
			isInitializedRef.current = false;
			if (onMemoryKeyChange) {
				onMemoryKeyChange("");
			}
		}

		prevPromptIdRef.current = currentPromptId;
	}, [promptId, onMemoryKeyChange]);

	// Reset when testcase changes
	useEffect(() => {
		const prevTestcaseId = prevTestcaseIdRef.current;
		const currentTestcaseId = testcaseId;

		if (prevTestcaseId !== currentTestcaseId) {
			isInitializedRef.current = false;
			setIsManuallyCleared(false);
		}

		prevTestcaseIdRef.current = currentTestcaseId;
	}, [testcaseId]);
	// Initialize and sync memory selection
	useEffect(() => {
		if (isUpdatingRef.current || !data?.memories) {
			return;
		}

		// If we have testcaseId but testcase data hasn't loaded yet, wait
		if (testcaseId && !testcase) {
			return;
		}

		const testcaseMemoryId = testcase?.testcase?.memoryId;
		const memoryIdToLoad =
			externalSelectedMemoryId || (testcaseMemoryId ? String(testcaseMemoryId) : "");
		const currentSelectedKey = selectedKeyRef.current;

		// If there's a memory to load and it's different from current selection
		if (memoryIdToLoad && memoryIdToLoad !== currentSelectedKey && !isManuallyCleared) {
			const memory = data.memories.find((item) => String(item.id) === memoryIdToLoad);

			if (memory) {
				setSelectedKey(String(memory.id));
				setMemoryValue(memory.value);
				originalValueRef.current = memory.value;
				if (onMemoryKeyChange && !isInitializedRef.current) {
					onMemoryKeyChange(String(memory.id));
				}
			}
		}
		// If no memory should be selected and we have one selected, clear it
		else if (!memoryIdToLoad && currentSelectedKey && !isManuallyCleared) {
			setSelectedKey("");
			setMemoryValue("");
			originalValueRef.current = "";
			if (onMemoryKeyChange) {
				onMemoryKeyChange("");
			}
		}

		if (!isInitializedRef.current) {
			isInitializedRef.current = true;
		}
	}, [
		data?.memories,
		testcase,
		externalSelectedMemoryId,
		onMemoryKeyChange,
		testcaseId,
		isManuallyCleared,
	]);

	// Update memory value when selectedKey changes
	useEffect(() => {
		if (isUpdatingRef.current || !isInitializedRef.current) {
			return;
		}

		if (selectedKey && data?.memories) {
			const memory = data.memories.find((item) => item.id === Number(selectedKey));

			if (memory && memory.value !== originalValueRef.current) {
				setMemoryValue(memory.value);
				originalValueRef.current = memory.value;
			}
		}
	}, [selectedKey, data?.memories]);

	// Notify parent of key changes
	useEffect(() => {
		if (isUpdatingRef.current || !isInitializedRef.current) {
			return;
		}

		if (onMemoryKeyChange) {
			if (lastNotifiedKeyRef.current !== selectedKey) {
				onMemoryKeyChange(selectedKey);
				lastNotifiedKeyRef.current = selectedKey;
			}
		}
	}, [selectedKey, onMemoryKeyChange]);

	const updateMemory = (promptId: number, value: string) => {
		const memory = data?.memories?.find((item) => item.id === Number(selectedKey));
		if (memory) {
			updateMemoryMutation.mutate(
				{ memoryId: memory.id, value },
				{
					onSuccess: () => {
						originalValueRef.current = value;
					},
				},
			);
		}
	};

	const onValueChange = (value: string) => {
		setMemoryValue(value);
	};

	const onBlurHandler = () => {
		if (promptId && selectedKey && memoryValue !== originalValueRef.current) {
			updateMemory(promptId, memoryValue);
		}
	};

	const onSelectKeyHandler = (key: string) => {
		if (selectedKey && memoryValue !== originalValueRef.current) {
			updateMemory(promptId, memoryValue);
		}

		setIsManuallyCleared(false);
		isUpdatingRef.current = true;

		if (key && data?.memories) {
			const memory = data.memories.find((item) => item.id === Number(key));
			if (memory) {
				setMemoryValue(memory.value);
				originalValueRef.current = memory.value;
			} else {
				setMemoryValue("");
				originalValueRef.current = "";
			}
		} else {
			setMemoryValue("");
			originalValueRef.current = "";
		}

		setSelectedKey(key);

		if (onMemoryKeyChange) {
			onMemoryKeyChange(key);
		}

		if (testcaseId && data?.memories) {
			const memory = data.memories.find((item) => item.id === Number(key));
			updateTestcaseMutation.mutate(
				{ testcaseId, memoryId: memory ? memory.id : null },
				{
					onSuccess: async () => {
						await Promise.all([refetch(), refetchTestcase()]);
						setTimeout(() => {
							isUpdatingRef.current = false;
						}, 100);
					},
					onError: () => {
						isUpdatingRef.current = false;
						toast({
							title: "Something went wrong",
							variant: "destructive",
						});
					},
				},
			);
		} else {
			isUpdatingRef.current = false;
		}
	};

	const clearSelectedMemory = async (e: React.MouseEvent) => {
		e.stopPropagation();

		if (selectedKey && memoryValue !== originalValueRef.current) {
			updateMemory(promptId, memoryValue);
		}

		setSelectedKey("");
		setMemoryValue("");
		originalValueRef.current = "";
		setIsManuallyCleared(true);
		isUpdatingRef.current = true;
		isInitializedRef.current = true; // Keep initialized to prevent re-initialization

		if (onMemoryKeyChange) {
			onMemoryKeyChange("");
		}

		if (testcaseId) {
			try {
				await updateTestcaseMutation.mutateAsync({
					testcaseId,
					memoryId: null,
				});

				toast({
					title: "Memory cleared",
					description: "Memory selection has been reset",
				});

				await Promise.all([refetch(), refetchTestcase()]);

				setTimeout(() => {
					isUpdatingRef.current = false;
				}, 100);
			} catch (error) {
				setIsManuallyCleared(false);
				isUpdatingRef.current = false;
				toast({
					title: "Something went wrong",
					variant: "destructive",
				});
			}
		} else {
			isUpdatingRef.current = false;
			toast({
				title: "Memory cleared",
				description: "Memory selection has been reset",
			});
		}
	};

	const createMemoryHandler = (key: string, value: string) => {
		createMemoryMutation.mutate(
			{ key, value },
			{
				onSuccess: async (response: any) => {
					setCreateMemoryModalOpen(false);
					setIsManuallyCleared(false);
					isUpdatingRef.current = true;

					const newMemoryId = response.memory?.id;
					if (!newMemoryId) {
						isUpdatingRef.current = false;
						return;
					}

					await refetch();

					setSelectedKey(String(newMemoryId));
					setMemoryValue(value);
					originalValueRef.current = value;
					isInitializedRef.current = true;

					if (testcaseId) {
						try {
							await updateTestcaseMutation.mutateAsync({
								testcaseId,
								memoryId: newMemoryId,
							});
						} catch (error) {
							console.error("Failed to update testcase:", error);
						}
					}

					if (onMemoryKeyChange) {
						onMemoryKeyChange(String(newMemoryId));
					}

					setTimeout(() => {
						isUpdatingRef.current = false;
					}, 100);

					toast({
						title: "Memory created",
						description: `Memory "${key}" has been created and selected`,
					});
				},
				onError: () => {
					isUpdatingRef.current = false;
					toast({
						title: "Something went wrong",
						variant: "destructive",
					});
				},
			},
		);
	};

	const selectedMemory = data?.memories?.find((item) => String(item.id) === selectedKey);

	const selectedKeyName =
		selectedMemory?.key ||
		(externalSelectedMemoryId &&
			data?.memories?.find((item) => String(item.id) === externalSelectedMemoryId)?.key);

	return (
		<>
			<div className="flex flex-col gap-2 mb-1">
				<div
					className="relative"
					onMouseEnter={() => selectedKey && setShowClearIcon(true)}
					onMouseLeave={() => setShowClearIcon(false)}
				>
					<Select value={selectedKey} onValueChange={onSelectKeyHandler}>
						<SelectTrigger className="text-sm font-normal leading-5 text-muted-foreground w-full">
							<SelectValue placeholder="Select">{selectedKeyName}</SelectValue>
						</SelectTrigger>

						<SelectContent className="space-y-1 text-sm font-normal leading-5 w-full">
							<div className="p-2">
								{data?.memories &&
									data.memories.length > 0 &&
									data.memories.map((item) => (
										<SelectItem key={item.id} value={String(item.id)}>
											{item.key}
										</SelectItem>
									))}

								{(!data?.memories || data.memories.length === 0) && (
									<div className="flex w-full items-center justify-center rounded-xl border border-dashed border-border p-4 shadow-sm bg-card">
										<div className="flex flex-col items-center gap-4 text-muted-foreground">
											<div className="p-4 rounded-xl border border-border shadow-md bg-card">
												<Inbox className="h-6 w-6" strokeWidth={1.5} />
											</div>
											<span className="text-base font-medium tracking-wide">
												No data
											</span>
										</div>
									</div>
								)}

								<div className="m-1 mt-2">
									<Button
										type="button"
										variant="secondary"
										size="sm"
										className="w-full justify-center gap-2 text-sm"
										onClick={(e) => {
											e.stopPropagation();
											setCreateMemoryModalOpen(true);
										}}
									>
										<PlusCircle className="h-4 w-4" />
										Create memory
									</Button>
								</div>
							</div>
						</SelectContent>
					</Select>

					{selectedKey && showClearIcon && (
						<button
							type="button"
							onClick={clearSelectedMemory}
							aria-label="Clear selected memory"
							className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors z-10
                        bg-muted hover:bg-accent text-muted-foreground"
						>
							<X className="h-4 w-4" />
						</button>
					)}
				</div>

				{selectedKey && (
					<>
						<p className="text-xs font-medium mt-2 text-foreground">Memory Value</p>
						<Textarea
							placeholder="Enter memory value"
							value={memoryValue}
							onChange={(e) => onValueChange(e.target.value)}
							onBlur={onBlurHandler}
							className="w-full min-h-[180px] max-h-[300px]"
						/>
					</>
				)}
			</div>

			<CreateMemoryDialog
				open={createMemoryModalOpen}
				setOpen={setCreateMemoryModalOpen}
				confirmationHandler={createMemoryHandler}
				loading={createMemoryMutation.isPending}
			/>
		</>
	);
};

export default MemoryKey;
