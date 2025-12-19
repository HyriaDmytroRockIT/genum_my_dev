import {
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	flexRender,
	ColumnDef,
	SortingState,
} from "@tanstack/react-table";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ChevronsUpDown } from "lucide-react";
import { EmptyState } from "@/pages/info-pages/EmptyState";

interface ModelStats {
	model: string;
	vendor: string;
	total_requests: number;
	total_tokens_in: number;
	total_tokens_out: number;
	average_response_ms: number;
	total_cost: number;
}

interface Props {
	models: ModelStats[];
}

export function TableModelStats({ models }: Props) {
	const [sorting, setSorting] = useState<SortingState>([]);

	const columns: ColumnDef<ModelStats>[] = [
		{
			accessorKey: "model",
			header: sortableHeader("Model"),
			cell: (info) => (
				<span className="font-medium text-foreground">{info.getValue() as string}</span>
			),
		},
		{
			accessorKey: "vendor",
			header: sortableHeader("Vendor"),
			cell: (info) => <span className="text-foreground/90">{info.getValue() as string}</span>,
		},
		{
			accessorKey: "total_requests",
			header: sortableHeader("Requests"),
		},
		{
			accessorKey: "total_tokens_in",
			header: sortableHeader("Tokens In"),
		},
		{
			accessorKey: "total_tokens_out",
			header: sortableHeader("Tokens Out"),
		},
		{
			accessorKey: "average_response_ms",
			header: sortableHeader("Avg Response (ms)"),
		},
		{
			accessorKey: "total_cost",
			header: sortableHeader("Cost"),
			cell: (info) => (
				<span className="tabular-nums">$ {(info.getValue() as number).toFixed(4)}</span>
			),
		},
	];

	const table = useReactTable({
		data: models,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<Card className="border-0 shadow-none flex-1 bg-card text-card-foreground">
			<CardHeader className="p-0 pb-4">
				<CardTitle className="text-foreground">Detailed Model Statistics</CardTitle>
			</CardHeader>

			<CardContent className="overflow-auto p-0">
				<Table className="overflow-hidden rounded-md">
					{/* header */}
					<TableHeader className="bg-muted">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className="h-5 text-nowrap">
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										onClick={
											header.column.getCanSort()
												? header.column.getToggleSortingHandler()
												: undefined
										}
										className="cursor-pointer select-none px-4 py-[10px] h-5"
									>
										<div className="flex items-center gap-1 text-[12px] text-muted-foreground">
											{flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
										</div>
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>

					{/* body */}
					<TableBody>
						{table.getRowModel().rows.length > 0 ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} className="hover:bg-muted/50">
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className="px-4 py-[9px] text-[14px]"
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow className="hover:bg-transparent">
								<TableCell
									colSpan={columns.length}
									className="text-center p-0 pt-4"
								>
									<EmptyState
										title="No data"
										description="No results found."
										minHeight="200px"
									/>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}

function sortableHeader(title: string) {
	return ({ column }: { column: any }) => {
		const sorted = column.getIsSorted();
		return (
			<div
				className="flex items-center gap-1 text-[12px] cursor-pointer select-none float-left"
				onClick={column.getToggleSortingHandler()}
			>
				<span className="text-muted-foreground">{title}</span>
				{sorted === "asc" ? (
					<svg
						className="h-3 w-3 text-foreground"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
					>
						<path d="m6 15 6-6 6 6" />
					</svg>
				) : sorted === "desc" ? (
					<svg
						className="h-3 w-3 text-foreground"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
					>
						<path d="m18 9-6 6-6-6" />
					</svg>
				) : (
					<ChevronsUpDown className="h-3 w-3 text-muted-foreground opacity-60" />
				)}
			</div>
		);
	};
}
