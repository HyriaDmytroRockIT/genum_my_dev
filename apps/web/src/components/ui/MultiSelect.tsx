import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";
import { cn } from "@/lib/utils";

export type Option = {
	label: string;
	value: string;
	icon?: React.ReactNode;
};

type Props = {
	label: string;
	options: Option[];
	disabled: boolean;
	selectedValues: string[];
	onChange: (value: string) => void;
};

const MultiSelect = ({ label, options, disabled, selectedValues, onChange }: Props) => {
	return (
		<Popover>
			<PopoverTrigger
				data-inactive={disabled ? "" : undefined}
				className={cn(
					"flex h-[32px] w-[50%] items-center justify-between whitespace-nowrap",
					"rounded-md rounded-tr-none rounded-br-none bg-transparent px-3 py-2",
					"text-xs [&_svg]:size-4 [&_span]:flex [&_span]:gap-1",
					"border border-border shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring",
					// стани
					"text-foreground",
					"data-[inactive]:opacity-60 data-[inactive]:cursor-not-allowed",
				)}
			>
				{label}
				<div className="flex items-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="lucide lucide-chevron-down h-4 w-4 text-muted-foreground"
						aria-hidden="true"
					>
						<path d="m6 9 6 6 6-6" />
					</svg>
				</div>
			</PopoverTrigger>

			<PopoverContent
				className="w-[265px] p-2 bg-popover text-popover-foreground"
				align="start"
			>
				{options.map((option: Option) => {
					const isSelected = selectedValues.includes(option.value);

					return (
						<div
							key={option.value}
							onClick={() => onChange(option.value)}
							className="flex justify-between items-center self-stretch rounded-sm py-1.5 px-2 hover:bg-muted cursor-pointer"
							role="menuitem"
						>
							<div className="flex items-center gap-1">
								{option.icon}
								<span className="text-xs not-italic font-normal leading-5 text-foreground">
									{option.label}
								</span>
							</div>

							<Checkbox
								checked={isSelected}
								onKeyDown={(e) => {
									if (e.key === "Enter") onChange(option.value);
								}}
							/>
						</div>
					);
				})}
			</PopoverContent>
		</Popover>
	);
};

export default MultiSelect;
