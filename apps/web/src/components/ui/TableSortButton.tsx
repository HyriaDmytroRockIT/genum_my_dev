import { cn } from "@/lib/utils";
import { Column } from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TableSortButtonProps<TData> {
	column: Column<TData, unknown>;
	headerText: string;
}

const TableSortButton = <TData,>({ column, headerText }: TableSortButtonProps<TData>) => {
	const isSorted = column.getIsSorted();
	return (
		<button
			className="flex items-center space-x-1"
			onClick={() => column.toggleSorting(isSorted === "asc")}
		>
			<span>{headerText}</span>
			<span className="flex flex-col ml-1">
				<ChevronUp
					className={cn(
						"h-3 w-4",
						isSorted === "asc" ? "text-foreground" : "text-muted-foreground",
					)}
				/>
				<ChevronDown
					className={cn(
						"h-3 w-4 mt-[-5px]",
						isSorted === "desc" ? "text-foreground" : "text-muted-foreground",
					)}
				/>
			</span>
		</button>
	);
};

export default TableSortButton;
