import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ListFilter } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Prompt } from "@/pages/prompt/Prompts";
import { TestStatus } from "@/types/TestСase";

const truncateText = (text: string, maxLength: number = 18) => {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength) + "...";
};

export type FilterState = {
	prompts?: number[];
	testcasesStatus: TestStatus[];
};

type TestCasesFilterProps = {
	prompts?: Prompt[];
	filterState: FilterState;
	setFilterState: Dispatch<SetStateAction<FilterState>>;
};

const testOptions: {
	value: TestStatus;
	label: string;
}[] = [
	{
		value: "OK",
		label: "Passed",
	},
	{
		value: "NOK",
		label: "Failed",
	},
	{
		value: "NEED_RUN",
		label: "Need run",
	},
];

const TestCasesFilter = ({ prompts, filterState, setFilterState }: TestCasesFilterProps) => {
	const [filtersOpen, setFiltersOpen] = useState(false);

	const [tempFilters, setTempFilters] = useState({ ...filterState });

	useEffect(() => {
		if (filtersOpen) {
			setTempFilters({ ...filterState });
		}
	}, [filtersOpen, filterState]);

	const toggleArrayValue = (
		value: number | TestStatus,
		arrayName: "prompts" | "testcasesStatus",
	) => {
		const currentArray = [...(tempFilters[arrayName] || [])];
		if (currentArray.includes(value)) {
			setTempFilters({
				...tempFilters,
				[arrayName]: currentArray.filter((v) => v !== value),
			});
		} else {
			setTempFilters({
				...tempFilters,
				[arrayName]: [...currentArray, value],
			});
		}
	};

	const resetFilters = () => {
		setTempFilters({
			prompts: [],
			testcasesStatus: [],
		});
	};

	const applyFilters = () => {
		setFilterState({ ...tempFilters });
		setFiltersOpen(false);
	};
	return (
		<Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" className="flex items-center gap-2">
					<ListFilter className="w-4 h-4" /> Filters
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[280px] p-4" align="start">
				<div className="flex flex-col gap-2">
					<h3 className="text-base-foreground leading-7 text-sm font-semibold tracking-tight">
						Filters
					</h3>

					<div className="flex flex-col gap-2">
						<span className="text-[#71717A] dark:text-[#a3a3a3] text-xs font-medium leading-none">
							Testcases Status
						</span>
						<div className="grid gap-2">
							{testOptions.map(({ value, label }) => (
								<label
									key={value}
									className="flex items-center space-x-2 cursor-pointer"
								>
									<Checkbox
										checked={tempFilters.testcasesStatus.includes(value)}
										onCheckedChange={() =>
											toggleArrayValue(value, "testcasesStatus")
										}
									/>
									<span className="text-sm break-all">{label}</span>
								</label>
							))}
						</div>
					</div>

					{!!prompts && (
						<div className="flex flex-col gap-2">
							<span className="text-[#71717A] dark:text-[#a3a3a3] text-xs font-medium leading-none">
								Prompts
							</span>
							<div className="grid gap-2">
								{prompts.map((item) => (
									<div key={item.id} className="flex items-center space-x-2">
										<Checkbox
											checked={tempFilters.prompts!.includes(item.id)}
											onCheckedChange={() =>
												toggleArrayValue(item.id, "prompts")
											}
										/>
										<span className="text-sm break-all" title={item.name}>
											{truncateText(item.name)}
										</span>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Action buttons */}
					<div className="flex justify-between">
						<Button variant="outline" onClick={resetFilters} type="button">
							Reset
						</Button>
						<Button onClick={applyFilters} type="button">
							Apply
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default TestCasesFilter;
