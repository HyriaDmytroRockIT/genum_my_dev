import React from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { promptApi } from "@/api/prompt";

interface CommitDialogProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	confirmationHandler: (value: string) => void;
	loading: boolean;
	promptId: number | string;
}

const CommitDialog: React.FC<CommitDialogProps> = ({
	open,
	setOpen,
	confirmationHandler,
	loading,
	promptId,
}) => {
	const [value, setValue] = useState("");
	const textareaRef = React.useRef<HTMLTextAreaElement>(null);

	const {
		refetch: fetchCommitMessage,
		isFetching: isGenerating,
		data: generatedMessageData,
	} = useQuery<{ message?: string }>({
		queryKey: ["generate-commit-message", String(promptId)],
		queryFn: async () => {
			return await promptApi.generateCommitMessage(promptId);
		},
		enabled: false,
	});

	React.useEffect(() => {
		if (!isGenerating && generatedMessageData?.message !== undefined) {
			setValue(generatedMessageData.message);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isGenerating, generatedMessageData]);

	// reset value after closing the modal
	React.useEffect(() => {
		if (!open) {
			setValue("");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	const handleGenerateCommitMessage = () => {
		setValue(""); // reset value before generation, to always insert new text
		fetchCommitMessage();
	};
	const confirmHandler = () => {
		confirmationHandler(value);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			if (!loading && value) {
				confirmHandler();
			}
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent
				onOpenAutoFocus={(e) => {
					e.preventDefault();
					textareaRef.current?.focus();
				}}
			>
				<DialogHeader>
					<DialogTitle>New Commit</DialogTitle>
				</DialogHeader>

				{/* <div className="space-y-4"> */}
				{/* <div>
            <p className="text-xs text-[#18181B] font-medium mb-2">Key</p>
            <Input
              placeholder="Enter key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div> */}
				<div className="mb-2">
					<div className="flex items-center justify-between">
						<p className="text-xs text-foreground/50 font-medium">Commit message</p>
						<button
							type="button"
							aria-label="Сгенерировать commit message автоматически"
							tabIndex={0}
							className={`p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 ${loading || isGenerating ? "cursor-not-allowed" : "hover:bg-blue-50 active:bg-blue-100"}`}
							disabled={loading || isGenerating}
							onClick={handleGenerateCommitMessage}
						>
							<svg
								width="17"
								height="18"
								viewBox="0 0 17 18"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<g clipPath="url(#clip0_6861_24864)">
									<path
										d="M7.28592 5.62695L6.92912 6.59086C6.46168 7.85487 6.22797 8.48688 5.76675 8.94809C5.30554 9.4093 4.67354 9.64302 3.40953 10.1105L2.44562 10.4673L3.40953 10.8241C4.67354 11.2915 5.30554 11.5259 5.76675 11.9864C6.22797 12.4469 6.46168 13.0796 6.92912 14.3436L7.28592 15.3076L7.64272 14.3436C8.11015 13.0796 8.34456 12.4476 8.80508 11.9864C9.2656 11.5252 9.89829 11.2915 11.1623 10.8241L12.1262 10.4673L11.1623 10.1105C9.89829 9.64302 9.26629 9.4093 8.80508 8.94809C8.34387 8.48688 8.11015 7.85487 7.64272 6.59086L7.28592 5.62695Z"
										stroke="#437BEF"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M12.6648 3.27414L12.8176 2.86133L12.9711 3.27414C13.1709 3.81625 13.2712 4.08731 13.4689 4.28507C13.6658 4.48193 13.9365 4.58219 14.4768 4.78231L14.4785 4.78293L14.892 4.93574L14.4792 5.08925C13.9371 5.28908 13.666 5.38935 13.4683 5.58711C13.2712 5.78418 13.1709 6.05523 12.9704 6.59734L12.9704 6.59735L12.8176 7.01016L12.6641 6.59735C12.4642 6.05523 12.364 5.78418 12.1662 5.58642C11.9693 5.38955 11.6986 5.28929 11.1583 5.08918L11.1567 5.08856L10.7432 4.93574L11.156 4.78224C11.6981 4.5824 11.9691 4.48214 12.1669 4.28438C12.364 4.08731 12.4642 3.81625 12.6648 3.27415L12.6648 3.27414Z"
										stroke="#437BEF"
										strokeWidth="0.7"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</g>
							</svg>
							{isGenerating && (
								<span className="absolute inset-0 flex items-center justify-center">
									<svg
										className="animate-spin"
										width="16"
										height="16"
										viewBox="0 0 16 16"
										fill="none"
									>
										<circle
											cx="8"
											cy="8"
											r="7"
											stroke="#437BEF"
											strokeWidth="2"
											strokeDasharray="10 10"
										/>
									</svg>
								</span>
							)}
						</button>
					</div>
					<Textarea
						ref={textareaRef}
						placeholder="Enter message"
						value={value}
						onChange={(e) => setValue(e.target.value)}
						onKeyDown={handleKeyDown}
						className="min-h-[140px]"
					/>
					<p className="pt-2 text-xs text-gray-500 text-right">
						<kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
							Ctrl
						</kbd>{" "}
						+{" "}
						<kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
							Enter
						</kbd>{" "}
						to commit
					</p>
				</div>
				{/* </div> */}

				<DialogFooter className="mt-4">
					<Button
						variant="outline"
						className="dark:bg-transparent"
						onClick={() => setOpen(false)}
					>
						Cancel
					</Button>
					<Button onClick={confirmHandler} disabled={loading || !value}>
						Commit
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default CommitDialog;
