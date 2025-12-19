import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { useToggle } from "@/hooks/useToggle";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { toast } from "@/hooks/useToast";
import { useState } from "react";
import { promptApi } from "@/api/prompt";

export const RollBackButton = () => {
	const { isOn, onToggle, offToggle } = useToggle();
	const [showSuccess, setShowSuccess] = useState(false);
	const [pending, setPending] = useState(false);
	const params = useParams();

	const handleRollback = async () => {
		if (!params.id || !params.versionId) return;
		setPending(true);
		try {
			await promptApi.rollbackVersion(params.id, params.versionId);
			setShowSuccess(true);
		} catch (error) {
			toast({
				title: "Something went wrong",
				variant: "destructive",
			});
		} finally {
			setPending(false);
		}
	};

	const handleClose = () => {
		offToggle();
		setShowSuccess(false);
	};
	return (
		<>
			<Dialog open={isOn} onOpenChange={handleClose}>
				<DialogContent className="min-w-[520px]">
					<DialogHeader>
						<DialogTitle className={showSuccess ? "text-[#2E9D2A]" : ""}>
							{!showSuccess ? "Rollback to this commit?" : "Rollback successfull"}
						</DialogTitle>
					</DialogHeader>

					<p className="text-muted-foreground text-[14px]">
						{!showSuccess ? (
							<>
								Are you sure you want to rollback to this commit?{" "}
								<span className="text-destructive">
									This action cannot be undone.
								</span>
							</>
						) : (
							"Prompt has been rolled back."
						)}
					</p>

					<DialogFooter className="">
						{!showSuccess && (
							<Button variant="outline" disabled={pending} onClick={offToggle}>
								Cancel
							</Button>
						)}
						<Button
							onClick={showSuccess ? handleClose : handleRollback}
							disabled={pending}
							variant={showSuccess ? "default" : "destructive"}
						>
							{showSuccess ? "Ok" : "Yes, rollback"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<div className="flex w-full -mt-2 justify-end">
				<Button
					variant="outline"
					onClick={onToggle}
					className="border-border text-foreground font-normal px-8"
				>
					<svg
						width="16"
						height="17"
						viewBox="0 0 16 17"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						className="mr-2"
					>
						<path
							d="M9.4026 13.6484C10.4804 13.6484 11.4054 13.2984 12.1776 12.5984C12.9498 11.8984 13.3359 11.0262 13.3359 9.98177C13.3359 8.93733 12.9498 8.0651 12.1776 7.3651C11.4054 6.6651 10.4804 6.3151 9.4026 6.3151H5.20261L6.93594 4.58177L6.0026 3.64844L2.66927 6.98177L6.0026 10.3151L6.93594 9.38177L5.20261 7.64844H9.4026C10.1026 7.64844 10.7109 7.87066 11.2276 8.3151C11.7443 8.75955 12.0026 9.3151 12.0026 9.98177C12.0026 10.6484 11.7443 11.204 11.2276 11.6484C10.7109 12.0929 10.1026 12.3151 9.4026 12.3151H4.66927V13.6484H9.4026Z"
							className="fill-foreground"
						/>
					</svg>
					Rollback
				</Button>
			</div>
		</>
	);
};
