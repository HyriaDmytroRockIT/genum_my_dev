import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EmptyState } from "@/pages/info-pages/EmptyState";
import { formatUserLocalDateTime } from "@/lib/formatUserLocalDateTime";

export interface Log {
	log_lvl: string;
	timestamp: string;
	source: string;
	vendor: string;
	model: string;
	tokens_sum: number;
	cost: number;
	response_ms: number;
	description?: string;
	tokens_in?: number;
	tokens_out?: number;
	in?: string;
	out?: string;
	log_type?: string;
	user_name?: string;
	memory_key?: string;
	api?: string;
	prompt_id?: number;
}

interface LogsTableProps {
	logs: Log[];
	promptNames: { id: number; name: string }[];
	isFetching: boolean;
	onLogClick: (log: Log) => void;
}

function timeAgo(s: string) {
	const diff = Date.now() - new Date(s).getTime();
	const m = 60e3,
		h = 60 * m,
		d = 24 * h;
	if (diff >= d) return `${Math.floor(diff / d)} day(s) ago`;
	if (diff >= h) return `${Math.floor(diff / h)} hour(s) ago`;
	if (diff >= m) return `${Math.floor(diff / m)} minute(s) ago`;
	return "just now";
}
function getPromptName(promptId: number | undefined, promptNames: { id: number; name: string }[]) {
	if (!promptId) return "-";
	return promptNames.find((p) => p.id === promptId)?.name || `Prompt ${promptId}`;
}
function isPromptDeleted(
	promptId: number | undefined,
	promptNames: { id: number; name: string }[],
) {
	if (!promptId) return false;
	return !promptNames.find((p) => p.id === promptId);
}

export const LogsTable: React.FC<LogsTableProps> = ({
	logs,
	promptNames,
	isFetching,
	onLogClick,
}) => (
	<TooltipProvider>
		<table className="w-full text-sm border border-border rounded-[6px] overflow-hidden bg-card text-card-foreground">
			<thead className="bg-muted h-[52.5px]">
				<tr>
					{[
						{ label: "Status", w: 50 },
						{ label: "Timestamp", w: 170 },
						{ label: "Source", w: 100 },
						{ label: "Vendor", w: 100 },
						{ label: "Model", w: 100 },
						{ label: "Prompt", w: 180 },
						{ label: "Total Tokens", w: 110 },
						{ label: "Cost", w: 90 },
						{ label: "Response", w: 80 },
						{ label: "Occurred", w: 120 },
					].map(({ label, w }) => (
						<th
							key={label}
							className="h-12 px-4 font-medium text-center text-muted-foreground whitespace-nowrap"
							style={{ width: w, minWidth: w, maxWidth: w }}
						>
							{label}
						</th>
					))}
				</tr>
			</thead>

			<tbody className="divide-y divide-border">
				{logs.length ? (
					logs.map((log, i) => {
						const hasErrorDescription = log.log_lvl === "ERROR" && log.description;
						const modelDisplay =
							log.model.length > 18 ? log.model.slice(0, 18) + "…" : log.model;
						const promptName = getPromptName(log.prompt_id, promptNames);
						const isDeleted = isPromptDeleted(log.prompt_id, promptNames);
						const promptDisplay = isDeleted
							? `Prompt ${log.prompt_id}`
							: promptName.length > 18
								? promptName.slice(0, 18) + "…"
								: promptName;

						return (
							<Tooltip key={`${log.timestamp}-${i}`}>
								<TooltipTrigger asChild>
									<tr
										className={`cursor-pointer transition-colors ${
											log.log_lvl === "ERROR"
												? "bg-red-50 hover:bg-red-100 dark:bg-[#3c292a]"
												: "hover:bg-muted/50"
										}`}
										onClick={() => onLogClick(log)}
									>
										<td className="p-4 text-center" style={{ width: 50 }}>
											{log.log_lvl === "SUCCESS" ? (
												<CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#2da44a] mx-auto" />
											) : (
												<XCircle className="h-4 w-4 text-destructive dark:text-[#d74746] mx-auto" />
											)}
										</td>

										<td className="p-4 text-center" style={{ width: 170 }}>
											{formatUserLocalDateTime(log.timestamp)}
										</td>

										<td
											className="p-4 text-center capitalize"
											style={{ width: 100 }}
										>
											{log.source === "ui" ? "UI" : log.source}
										</td>

										<td className="p-4 text-center" style={{ width: 110 }}>
											{log.vendor}
										</td>

										<td
											className="p-4 text-center truncate"
											style={{ width: 140 }}
											title={log.model}
										>
											{modelDisplay}
										</td>

										<td
											className="p-4 text-center truncate"
											style={{ width: 180 }}
											title={promptName}
										>
											{isDeleted ? (
												<Tooltip>
													<TooltipTrigger asChild>
														<span className="text-destructive">
															{promptDisplay}
														</span>
													</TooltipTrigger>
													<TooltipContent>
														<p>Prompt was deleted</p>
													</TooltipContent>
												</Tooltip>
											) : (
												promptDisplay
											)}
										</td>

										<td className="p-4 text-center" style={{ width: 110 }}>
											{log.tokens_sum}
										</td>

										<td
											className="p-4 text-center tabular-nums"
											style={{ width: 90 }}
										>
											${log.cost.toFixed(6)}
										</td>

										<td className="p-4 text-center" style={{ width: 80 }}>
											{Math.round(log.response_ms)} ms
										</td>

										<td className="p-4 text-center" style={{ width: 120 }}>
											{timeAgo(log.timestamp)}
										</td>
									</tr>
								</TooltipTrigger>

								{hasErrorDescription && (
									<TooltipContent
										side="top"
										align="start"
										showArrow={false}
										className="max-w-[364px] p-4 bg-popover text-popover-foreground border border-border shadow-lg rounded-lg mb-[-50px] ml-[20%]"
									>
										<div className="space-y-2">
											<h3 className="text-sm font-semibold">
												Error Description
											</h3>
											<p className="text-sm dark:text-[#FFFFFF]">
												{log.description}
											</p>
										</div>
									</TooltipContent>
								)}
							</Tooltip>
						);
					})
				) : (
					<tr>
						<td colSpan={10} className="pt-6 text-center">
							{isFetching ? (
								<span className="text-muted-foreground">Loading...</span>
							) : (
								<EmptyState
									title="No logs"
									description="No logs found for the selected filters."
								/>
							)}
						</td>
					</tr>
				)}
			</tbody>
		</table>
	</TooltipProvider>
);
