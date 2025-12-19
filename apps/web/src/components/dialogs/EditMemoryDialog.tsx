import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Memory {
	id: number;
	key: string;
	value: string;
	promptId?: number;
	createdAt?: string;
	updatedAt?: string;
}

interface EditMemoryDialogProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	confirmationHandler: (value: string) => void;
	loading: boolean;
	initialData: Memory | undefined;
}

const EditMemoryDialog: React.FC<EditMemoryDialogProps> = ({
	open,
	setOpen,
	confirmationHandler,
	loading,
	initialData,
}) => {
	const [value, setValue] = useState("");

	// Set initial values when dialog opens or initialData changes
	useEffect(() => {
		if (initialData && open) {
			setValue(initialData.value || "");
		}
	}, [initialData, open]);

	// Reset form when dialog closes
	useEffect(() => {
		if (!open) {
			setValue("");
		}
	}, [open]);

	const handleConfirm = () => {
		if (value.trim()) {
			confirmationHandler(value.trim());
		}
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="max-w-lg">
				<DialogHeader className="flex flex-row items-center justify-between">
					<DialogTitle>Edit Memory</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-0">
					<div className="space-y-2">
						<Label htmlFor="memory-value">Memory Value</Label>
						<Textarea
							id="memory-value"
							placeholder="Enter memory value"
							value={value}
							onChange={(e) => setValue(e.target.value)}
							className="w-full min-h-[120px] resize-none"
						/>
					</div>
				</div>

				<div className="flex justify-end gap-3 pt-4">
					<Button variant="outline" onClick={handleClose} disabled={loading}>
						Cancel
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={loading || !value.trim()}
						className="px-6"
					>
						{loading ? "Saving..." : "Save Changes"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default EditMemoryDialog;
