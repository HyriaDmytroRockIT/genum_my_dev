import { Inbox } from "lucide-react";

interface EmptyStateProps {
	title: string;
	description: string;
	minHeight?: string;
}

export const EmptyState = ({ title, description, minHeight = "361px" }: EmptyStateProps) => (
	<div
		className="flex w-full items-center justify-center rounded-xl border border-dashed border-border p-6 shadow-none bg-background"
		style={{ minHeight }}
		role="region"
		aria-label="Empty state"
	>
		<div className="flex flex-col items-center gap-6 text-muted-foreground">
			<div className="flex items-center justify-center rounded-xl h-12 w-12 border border-border shadow-sm text-foreground">
				<Inbox className="h-6 w-6" strokeWidth={1.5} />
			</div>

			<div className="flex flex-col gap-2">
				<span className="text-foreground font-semibold text-[20px] leading-[28px] text-center tracking-wide">
					{title}
				</span>
				<span className="text-muted-foreground text-[14px] text-center">{description}</span>
			</div>
		</div>
	</div>
);
