import { useState } from "react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { RadioButton, RadioGroup } from "./radioButton";
import { Loader2 } from "lucide-react";

export type Option = {
	label: string;
	value: string;
	icon?: React.ReactNode;
};

type Props = {
	label: string;
	options: Option[];
	selectedValues: string[];
	onChange: (value: string) => void;
	rowLength: number | undefined;
	runTestHandler: () => void;
	loading?: boolean;
};

const ButtonWithDropdown = ({
	label,
	runTestHandler,
	options,
	selectedValues,
	rowLength,
	onChange,
	loading = false,
}: Props) => {
	const [open, setOpen] = useState(false);

	const handleValueChange = (value: string) => {
		onChange(value);
		setOpen(false);
	};

	const isDisabled = rowLength === 0 || rowLength === undefined;

	return (
		<div className="flex items-center ml-3">
			<Button
				className="flex-1 rounded-tr-[0px] rounded-br-[0px] min-w-[150px] max-w-full px-4 text-left justify-start truncate"
				onClick={runTestHandler}
				disabled={isDisabled || loading}
			>
				{loading && (
					<Loader2 className="mr-2 h-4 w-4 animate-spin inline-block align-middle" />
				)}
				{label}
			</Button>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button
						className={`
              flex w-9 h-9 items-center justify-center whitespace-nowrap rounded-md
              bg-primary text-primary-foreground px-2 py-2 shadow-sm ring-offset-background
              data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1
              focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50
              [&>span]:line-clamp-1 text-xs [&_svg]:size-4 [&_span]:flex [&_span]:gap-1
              rounded-tl-none rounded-bl-none focus:!outline-none focus:!ring-0
              hover:bg-primary/90 cursor-pointer
            `}
						type="button"
					>
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
							className="lucide lucide-chevron-down h-4 w-4 text-primary-foreground"
							aria-hidden="true"
						>
							<path d="m6 9 6 6 6-6"></path>
						</svg>
					</button>
				</PopoverTrigger>
				<PopoverContent className="w-48 p-2" align="start">
					<RadioGroup value={selectedValues[0] || ""} onValueChange={handleValueChange}>
						{options.map((option: Option) => (
							<div
								key={option.value}
								className="flex justify-between items-center self-stretch rounded-sm py-1.5 px-2 hover:bg-muted/50 cursor-pointer"
								onClick={() => handleValueChange(option.value)}
							>
								<label className="w-full flex items-center justify-between space-x-2 cursor-pointer pointer-events-none">
									<div className="flex items-center gap-1">
										{option.icon}
										<span className="text-base-foreground text-[12px] font-normal leading-[20px]">
											{option.label}
										</span>
									</div>
									<RadioButton value={option.value} />
								</label>
							</div>
						))}
					</RadioGroup>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export default ButtonWithDropdown;
