import clsx from "clsx";

import { Button } from "@/components/ui/button";
import { Branch } from "@/pages/prompt/playground-tabs/version/Versions";
import { MoreHorizontal, GitCommitHorizontal, Copy } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { EmptyState } from "@/pages/info-pages/EmptyState";

const LETTER_COLOR_MAP: Record<string, string> = {
	A: "bg-[#D6CFFF]",
	B: "bg-[#BBCAFF]",
	C: "bg-[#BFDEFF]",
	D: "bg-[#D5F0FF]",
	E: "bg-[#D7EFEB]",
	F: "bg-[#D6F6E6]",
	G: "bg-[#DEEADE]",
	H: "bg-[#E7F5C8]",
	I: "bg-[#FFE4F2]",
	J: "bg-[#FFD7D8]",
	K: "bg-[#FFE6B1]",
	L: "bg-[#F9ECDB]",
	M: "bg-[#D6CFFF]",
	N: "bg-[#BBCAFF]",
	O: "bg-[#BFDEFF]",
	P: "bg-[#D5F0FF]",
	Q: "bg-[#D7EFEB]",
	R: "bg-[#D6F6E6]",
	S: "bg-[#DEEADE]",
	T: "bg-[#E7F5C8]",
	U: "bg-[#FFE4F2]",
	V: "bg-[#FFD7D8]",
	W: "bg-[#FFE6B1]",
	X: "bg-[#F9ECDB]",
	Y: "bg-[#D6CFFF]",
	Z: "bg-[#BBCAFF]",
};

const getColorByFirstLetter = (name: string): string => {
	const firstLetter = name?.[0]?.toUpperCase() || "A";
	return LETTER_COLOR_MAP[firstLetter] || "bg-[#D6CFFF]";
};

const PopoverCustom = () => {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="icon" disabled className="h-7 w-7">
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-44 p-1">
				<div className="flex flex-col">
					<Button variant="ghost" className="justify-start">
						<Copy className="w-4 h-4 mr-2" />
						Duplicate
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
};

type CommitTimelineProps = {
	branches: Branch[];
};

interface Author {
	id: number;
	name: string;
	email: string;
}

interface PromptVersion {
	id: number;
	commitMsg: string;
	commitHash: string;
	createdAt: string;
	author: Author;
}

interface GroupedCommits {
	date: string;
	commits: PromptVersion[];
}

function groupCommitsByDate(branches: Branch[]): GroupedCommits[] {
	if (!branches) return [];

	const allCommits: PromptVersion[] = [];
	branches.forEach((branch) => {
		if (branch.promptVersions) {
			allCommits.push(...branch.promptVersions);
		}
	});

	allCommits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	const grouped = allCommits.reduce((acc, commit) => {
		const date = new Date(commit.createdAt).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});

		const existing = acc.find((group) => group.date === date);
		if (existing) {
			existing.commits.push(commit);
		} else {
			acc.push({ date, commits: [commit] });
		}

		return acc;
	}, [] as GroupedCommits[]);

	return grouped;
}

export default function CommitTimeline({ branches }: CommitTimelineProps) {
	const location = useLocation();

	const productiveCommitId =
		branches && branches.length > 0 && "productiveCommitId" in branches[0]
			? (branches[0] as any).productiveCommitId
			: null;

	const hasBranches = branches && branches.length > 0;
	const hasAnyVersions =
		hasBranches &&
		branches.some((branch) => branch.promptVersions && branch.promptVersions.length > 0);

	if (!hasBranches) {
		return <EmptyState title="No commits found" description="Create a new commit to start." />;
	}

	if (!hasAnyVersions) {
		return (
			<EmptyState
				title="No commits found"
				description="Make your first commit to get started."
			/>
		);
	}

	function formatTimeAgo(dateString: string): string {
		const diffMs = Date.now() - new Date(dateString).getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

		if (diffDays > 0) {
			return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
		} else if (diffHours > 0) {
			return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
		} else {
			return "just now";
		}
	}

	const groupedCommits = groupCommitsByDate(branches);

	return (
		<div className="p-1 py-4">
			{groupedCommits.map((group, groupIndex) => {
				const isLastGroup = groupIndex === groupedCommits.length - 1;

				return (
					<div key={groupIndex} className="relative">
						{/* Header row per date */}
						<div className="flex justify-between">
							<div className="flex items-center gap-2">
								<GitCommitHorizontal className="w-7 h-7 text-foreground" />
								<div className="text-sm text-muted-foreground font-medium">
									{group.date}
								</div>
							</div>

							{groupIndex < 1 && (
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<span className="w-7" />
										<span />
									</div>
									<div className="flex gap-2 text-sm text-muted-foreground">
										<span className="w-28" />
										<span className="w-28 flex items-center justify-center">
											Commit Hash
										</span>
										{/* <span className="w-16 text-center">Actions</span> */}
									</div>
								</div>
							)}
						</div>

						{/* Vertical line + commits */}
						<div
							className={clsx(
								"border-l-2 border-border ml-3 pl-4 py-3",
								isLastGroup ? "pb-0" : "pb-4",
							)}
						>
							{group.commits.map((version) => {
								const authorBg = getColorByFirstLetter(version.author.name);
								return (
									<div
										key={version.id}
										className="flex items-start gap-4 relative py-3 pl-4 border-b border-border hover:bg-muted/60 transition-colors"
									>
										{/* Author letter box — ЗАЛИШАЄМО ТВОЇ КОЛЬОРИ ФОНУ */}
										<div
											className={clsx(
												"w-8 h-8 rounded-md flex items-center justify-center font-semibold",
												// to make the text readable over your light background in both themes:
												"text-slate-800 dark:text-slate-900",
												authorBg,
											)}
										>
											{version.author.name[0].toUpperCase()}
										</div>

										<div className="flex-1">
											<div className="flex justify-between items-center">
												<Link
													to={`${location.pathname}/${version.id}`}
													className="w-full"
												>
													<p className="text-sm font-semibold leading-5 text-foreground">
														{version.commitMsg}
													</p>
													<p className="text-sm text-muted-foreground leading-5">
														{version.author.name} authored{" "}
														{formatTimeAgo(version.createdAt)}
													</p>
												</Link>

												<div className="flex items-center gap-2">
													{/* productive badge */}
													<span className="w-28">
														{productiveCommitId &&
															version.id === productiveCommitId && (
																<span className="border border-green-600/40 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 text-[12px] font-semibold px-3 py-[2px] rounded">
																	productive
																</span>
															)}
													</span>

													{/* commit hash chip */}
													<div className="w-28 flex items-center justify-center">
														<div className="flex items-center w-fit text-[12px] dark:bg-[#27272a] dark:border-[#3a3a3a] dark:text-[#fff] rounded-sm border border-border px-2 py-0 font-semibold text-foreground">
															<span>
																{version.commitHash.substring(0, 8)}
															</span>
														</div>
													</div>

													{/* <div className="w-16 flex justify-center actions">
                            <PopoverCustom />
                          </div> */}
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
}
