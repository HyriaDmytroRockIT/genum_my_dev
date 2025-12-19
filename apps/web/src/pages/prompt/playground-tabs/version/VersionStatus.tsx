import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { promptApi } from "@/api/prompt";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/useToast";
import CommitDialog from "@/components/dialogs/CommitDialog";
import LastCommitInfo from "@/components/layout/header/LastCommitInfo";

const VersionStatus = ({
	promptId,
	commited,
	onCommitStatusUpdate,
	onCommitStatusChange,
}: {
	promptId: number;
	commited: boolean;
	promptCommit: string;
	onCommitStatusUpdate?: (callback: (commited: boolean) => void) => void;
	onCommitStatusChange?: (commited: boolean) => void;
}) => {
	const [commitDialogOpen, setCommitDialogOpen] = useState(false);

	const queryClient = useQueryClient();
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (onCommitStatusUpdate) {
			const updateCommitStatus = (newCommited: boolean) => {
				if (onCommitStatusChange) {
					onCommitStatusChange(newCommited);
				}
			};
			onCommitStatusUpdate(updateCommitStatus);
		}
	}, [onCommitStatusUpdate, onCommitStatusChange]);

	const commitHandler = async (value: string) => {
		setIsLoading(true);
		try {
			await promptApi.commitPrompt(promptId, { commitMessage: value });
			setCommitDialogOpen(false);

			if (onCommitStatusChange) {
				onCommitStatusChange(true);
			}

			queryClient.setQueryData(["prompt", promptId], (oldData: any) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					prompt: {
						...oldData.prompt,
						commited: true,
						lastCommit: "committed",
					},
				};
			});

			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: ["prompt", promptId],
				}),
				queryClient.invalidateQueries({
					queryKey: ["prompts"],
				}),
				queryClient.invalidateQueries({
					queryKey: ["branches", String(promptId)],
				}),
			]);

			setTimeout(async () => {
				await queryClient.refetchQueries({
					queryKey: ["prompt", promptId],
				});
			}, 100);

			toast({
				title: "Changes committed successfully",
			});
		} catch (error) {
			if (onCommitStatusChange) {
				onCommitStatusChange(false);
			}
			toast({
				title: "Something went wrong",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const isCommitted = Boolean(commited);

	return (
		<>
			<div className="flex items-center gap-2">
				<LastCommitInfo promptId={promptId} />
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								className="rounded-md text-[13px] bg-black dark:bg-[#ECECEC] dark:text-primary-foreground hover:bg-gray-800 text-white w-[138px] h-[32px]"
								onClick={() => {
									setCommitDialogOpen(true);
								}}
								disabled={isCommitted || isLoading}
							>
								{isLoading ? "Committing..." : "Commit"}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Save prompt changes</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>

			<CommitDialog
				open={commitDialogOpen}
				setOpen={setCommitDialogOpen}
				confirmationHandler={commitHandler}
				loading={isLoading}
				promptId={promptId}
			/>
		</>
	);
};

export default VersionStatus;
