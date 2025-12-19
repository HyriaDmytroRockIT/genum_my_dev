import React from "react";

export type FilterChip = {
	key: string | number;
	label: string;
	onRemove: () => void;
};

const ActiveFilterChips: React.FC<{
	chips: { key: string; label: string; onRemove: () => void }[];
}> = ({ chips }) => (
	<div className="flex items-center gap-2 overflow-x-auto">
		{chips.map((chip) => (
			<button
				key={chip.key}
				className="flex items-center gap-1 px-4 py-2 text-sm bg-muted rounded-full whitespace-nowrap"
				onClick={chip.onRemove}
			>
				<span className="whitespace-nowrap">{chip.label}</span>
				<svg
					className="h-4 w-4 ml-1 rotate-45"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<line x1="12" y1="5" x2="12" y2="19" />
					<line x1="5" y1="12" x2="19" y2="12" />
				</svg>
			</button>
		))}
	</div>
);

export default ActiveFilterChips;
