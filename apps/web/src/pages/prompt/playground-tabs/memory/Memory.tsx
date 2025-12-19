import useQueryWithAuth from "@/hooks/useQueryWithAuth";
import {
	flexRender,
	useReactTable,
	getCoreRowModel,
	SortingState,
	getSortedRowModel,
	ColumnDef,
} from "@tanstack/react-table";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import DeleteConfirmDialog from "@/components/dialogs/DeleteConfirmDialog";
import useMemoryColumns, { MemoryTypes } from "@/hooks/useMemoryColumns";
import { CirclePlus, ChevronsUpDown } from "lucide-react";
import CreateMemoryDialog from "@/components/dialogs/CreateMemoryDialog";
import EditMemoryDialog from "@/components/dialogs/EditMemoryDialog";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/useToast";
import { SearchInput } from "@/components/ui/searchInput";
import { EmptyState } from "@/pages/info-pages/EmptyState";
import { promptApi } from "@/api/prompt";

interface Memory {
	id: number;
	key: string;
	value: string;
	promptId?: number;
	updatedAt?: string;
	createdAt?: string;
}

export default function Memory() {
	const [createMemoryModal, setCreateMemoryModal] = useState(false);
	const [editMemoryModal, setEditMemoryModal] = useState(false);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
	const [selectedMemory, setSelectedMemory] = useState<MemoryTypes | null>(null);
	const [editingMemory, setEditingMemory] = useState<Memory | undefined>(undefined);
	const [search, setSearch] = useState("");
	const [sorting, setSorting] = useState<SortingState>([]);

	const { id } = useParams<{ id: string }>();
	const [currentPromptId, setCurrentPromptId] = useState(id);

	const { data, refetch } = useQueryWithAuth({
		keys: ["memoriesForPromt", id || "empty"],
		enabled: !!id,
		queryFn: async () => {
			if (!id) throw new Error("Prompt ID is required");
			return await promptApi.getMemories(id);
		},
	});

	const handleRowClick = (memory: Memory, event: React.MouseEvent) => {
		const target = event.target as HTMLElement;
		if (target.closest("button") || target.closest('[role="button"]')) return;
		setEditingMemory(memory);
		setEditMemoryModal(true);
	};

	const handleEditClick = useCallback((memory: MemoryTypes) => {
		const memoryForEdit = {
			id: memory.id,
			key: memory.key,
			value: memory.value,
			promptId: memory.promptId,
			updatedAt: memory.updatedAt,
			createdAt: memory.createdAt,
		};
		setEditingMemory(memoryForEdit);
		setEditMemoryModal(true);
	}, []);

	const columns = useMemoryColumns({
		setConfirmModalOpen,
		setSelectedMemory,
		onEditClick: handleEditClick,
	});

	const filteredMemories = useMemo(() => {
		if (!data?.memories) return [];
		return data.memories.filter((memory: Memory) => {
			const q = search.toLowerCase();
			return (
				q === "" ||
				memory.key.toLowerCase().includes(q) ||
				memory.value.toLowerCase().includes(q)
			);
		});
	}, [data?.memories, search]);

	const table = useReactTable<Memory>({
		data: filteredMemories || [],
		columns: columns as ColumnDef<Memory>[],
		getCoreRowModel: getCoreRowModel(),
		state: { sorting },
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		enableSortingRemoval: true,
	});

	const createMemoryMutation = useMutation({
		mutationFn: async ({ key, value }: { key: string; value: string }) => {
			if (!id) throw new Error("Prompt ID is required");
			return await promptApi.createMemory(id, { key, value });
		},
		onSuccess: () => {
			refetch();
			setCreateMemoryModal(false);
		},
		onError: () => {
			toast({ title: "Something went wrong", variant: "destructive" });
		},
	});

	const updateMemoryMutation = useMutation({
		mutationFn: async ({ memoryId, value }: { memoryId: number; value: string }) => {
			if (!id) throw new Error("Prompt ID is required");
			return await promptApi.updateMemory(id, memoryId, { value });
		},
		onSuccess: () => {
			refetch();
			setEditMemoryModal(false);
			setEditingMemory(undefined);
		},
		onError: () => {
			toast({ title: "Something went wrong", variant: "destructive" });
		},
	});

	const deleteMemoryMutation = useMutation({
		mutationFn: async (memoryId: number) => {
			if (!id) throw new Error("Prompt ID is required");
			return await promptApi.deleteMemory(id, memoryId);
		},
		onSuccess: () => {
			refetch();
			setConfirmModalOpen(false);
			setSelectedMemory(null);
		},
		onError: () => {
			toast({ title: "Something went wrong", variant: "destructive" });
		},
	});

	const createMemoryHandler = (key: string, value: string) => {
		createMemoryMutation.mutate({ key, value });
	};

	const editMemoryHandler = (value: string) => {
		if (!editingMemory) return;
		updateMemoryMutation.mutate({ memoryId: editingMemory.id, value });
	};

	const confirmationDeleteHandler = () => {
		if (!selectedMemory) return;
		deleteMemoryMutation.mutate(selectedMemory.id);
	};

	const getSortIcon = (column: any) => {
		const isSorted = column.getIsSorted();
		if (isSorted === "asc") {
			return (
				<span className="flex flex-col ml-1">
					<svg className="h-3 w-4 text-foreground" viewBox="0 0 24 24" fill="none">
						<path
							d="m18 15-6-6-6 6"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					<svg
						className="h-3 w-4 -mt-1 text-muted-foreground"
						viewBox="0 0 24 24"
						fill="none"
					>
						<path
							d="m6 9 6 6 6-6"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</span>
			);
		} else if (isSorted === "desc") {
			return (
				<span className="flex flex-col ml-1">
					<svg className="h-3 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none">
						<path
							d="m18 15-6-6-6 6"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					<svg className="h-3 w-4 -mt-1 text-foreground" viewBox="0 0 24 24" fill="none">
						<path
							d="m6 9 6 6 6-6"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</span>
			);
		} else {
			return <ChevronsUpDown className="ml-1 h-4 w-4 text-muted-foreground" />;
		}
	};

	useEffect(() => {
		if (id !== currentPromptId) {
			setSearch("");
			setSelectedMemory(null);
			setEditingMemory(undefined);
			setSorting([]);
			setCurrentPromptId(id);
			if (id) refetch();
		}
	}, [id, currentPromptId, refetch]);

	return (
		<>
			<div className="space-y-6 max-w-[1232px] 2xl-plus:max-w-[70%] 2xl-plus:min-w-[1232px] 2xl-plus:w-[70%] ml-3 mr-6 w-full pt-8 bg-background text-foreground">
				<div className="flex justify-between">
					<div className="flex items-center gap-3">
						<SearchInput
							placeholder="Search..."
							className="min-w-[241px]"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
					<Button className="px-7" onClick={() => setCreateMemoryModal(true)}>
						<CirclePlus className="mr-2 h-4 w-4" />
						Create New Memory
					</Button>
				</div>

				<div className="rounded-md overflow-hidden">
					<Table>
						<TableHeader className="bg-muted text-muted-foreground text-sm font-medium leading-5">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow
									key={headerGroup.id}
									className="[&_th:first-child]:text-left text-left [&_th:last-child]:text-right"
								>
									{headerGroup.headers.map((header) => (
										<TableHead
											key={header.id}
											className="h-auto py-4 px-[14px] text-left"
										>
											{header.column.getCanSort() ? (
												<div
													className="flex items-center gap-2 cursor-pointer select-none hover:bg-accent rounded px-2 py-1 -mx-2 -my-1 transition-colors"
													onClick={header.column.getToggleSortingHandler()}
													title={
														header.column.getCanSort()
															? header.column.getNextSortingOrder() ===
																"asc"
																? "Sort ascending"
																: header.column.getNextSortingOrder() ===
																		"desc"
																	? "Sort descending"
																	: "Clear sort"
															: undefined
													}
												>
													{flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
													{getSortIcon(header.column)}
												</div>
											) : (
												flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)
											)}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>

						<TableBody>
							{table.getRowModel().rows.length > 0 &&
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										className="cursor-pointer [&_td:first-child]:text-left [&_td:last-child]:text-right hover:bg-muted/50 transition-colors"
										onClick={(event) => handleRowClick(row.original, event)}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id} className="text-left">
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
								))}
						</TableBody>
					</Table>
				</div>

				{table.getRowModel().rows.length === 0 && (
					<EmptyState
						title="No data"
						description={
							search
								? "No results found with the current search."
								: "No memory keys found. Create one to begin."
						}
					/>
				)}
			</div>

			<CreateMemoryDialog
				open={createMemoryModal}
				setOpen={setCreateMemoryModal}
				confirmationHandler={createMemoryHandler}
				loading={createMemoryMutation.isPending}
			/>

			<EditMemoryDialog
				open={editMemoryModal}
				setOpen={setEditMemoryModal}
				confirmationHandler={editMemoryHandler}
				loading={updateMemoryMutation.isPending}
				initialData={editingMemory}
			/>

			<DeleteConfirmDialog
				open={confirmModalOpen}
				setOpen={setConfirmModalOpen}
				confirmationHandler={confirmationDeleteHandler}
				loading={deleteMemoryMutation.isPending}
			/>
		</>
	);
}
