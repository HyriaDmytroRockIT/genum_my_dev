import CompareDiffEditor from "@/components/ui/DiffEditor";
import { useEffect, useState, useCallback } from "react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
	chainOfThoughts?: string;
	original: string;
	modified: string;
	isLoading?: boolean;
	onSave: (value: string) => void;
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	onChange?: (value: string) => void;
}

const PromptDiff = ({
	original,
	modified,
	onChange,
	isLoading,
	onSave,
	isOpen,
	onOpenChange,
}: Props) => {
	const [modifiedPrompt, setModifiedPrompt] = useState<string>(modified ?? "");

	useEffect(() => {
		setModifiedPrompt(modified);
	}, [modified]);

	const changeHandler = useCallback(
		(value: string) => {
			setModifiedPrompt(value ?? "");
			onChange?.(value ?? "");
		},
		[onChange],
	);

	const saveHandler = useCallback(() => {
		onSave(modifiedPrompt);
	}, [onSave, modifiedPrompt]);

	const handleReject = useCallback(() => {
		onOpenChange(false);
	}, [onOpenChange]);

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className={"max-w-4xl gap-6"}>
				<DialogHeader>
					<DialogTitle>Prompt Diff</DialogTitle>
				</DialogHeader>

				<div className="text-sm min-h-[40rem] max-h-[80vh] pr-px rounded-[6px] border overflow-hidden">
					{isOpen && (
						<CompareDiffEditor
							original={original}
							modified={modifiedPrompt}
							onChange={changeHandler}
							renderOverviewRuler={true}
						/>
					)}
				</div>

				<DialogFooter className="mt-4">
					<Button variant="outline" onClick={handleReject}>
						Reject
					</Button>
					<Button type="submit" onClick={saveHandler} disabled={isLoading}>
						Accept
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default PromptDiff;
