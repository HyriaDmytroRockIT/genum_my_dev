import { useState, useRef } from "react";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { userApi } from "@/api/user";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SidebarMenuButton } from "@/components/sidebar/sidebar";
import { MessageSquare } from "lucide-react";

export function SidebarFeedbackButton() {
	const { toast } = useToast();

	const [open, setOpen] = useState(false);
	const [type, setType] = useState("Question");
	const [subject, setSubject] = useState("");
	const [message, setMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const messageInputRef = useRef<HTMLTextAreaElement>(null);

	const feedbackTypes = ["Question", "Report bug", "Feature request", "Other"];

	const handleFeedbackSubmit = async () => {
		if (!subject.trim() || !message.trim()) {
			toast({
				title: "Error",
				description: "Please fill in both subject and message fields.",
				variant: "destructive",
				duration: 3000,
			});
			return;
		}

		const apiType = type.toLowerCase().replace(/ /g, "_");

		setIsSubmitting(true);
		try {
			await userApi.sendFeedback({
				type: apiType,
				subject: subject.trim(),
				message: message.trim(),
			});

			toast({
				title: "Success",
				description: "Thank you for your feedback! We'll get back to you soon.",
				duration: 3000,
			});
			setSubject("");
			setMessage("");
			setType("Question");
			setOpen(false);
		} catch (error) {
			console.error("Error submitting feedback:", error);
			toast({
				title: "Error",
				description: "Failed to submit feedback. Please try again.",
				variant: "destructive",
				duration: 3000,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (newOpen && messageInputRef.current) {
			setTimeout(() => {
				messageInputRef.current?.focus();
			}, 100);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<SidebarMenuButton tooltip="Send Feedback">
					<MessageSquare />
					<span className="group-data-[collapsible=icon]:hidden">Send Feedback</span>
				</SidebarMenuButton>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Send Feedback</DialogTitle>
					<DialogDescription>
						Help us improve by sharing your thoughts, reporting bugs, or requesting
						features.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="feedback-type">Type</Label>
						<Select value={type} onValueChange={setType}>
							<SelectTrigger>
								<SelectValue placeholder="Select feedback type" />
							</SelectTrigger>
							<SelectContent>
								{" "}
								{feedbackTypes.map((feedbackType) => (
									<SelectItem key={feedbackType} value={feedbackType}>
										{feedbackType}{" "}
									</SelectItem>
								))}{" "}
							</SelectContent>
						</Select>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="subject">Subject</Label>
						<Input
							id="subject"
							placeholder="Brief description of your feedback"
							value={subject}
							onChange={(e) => setSubject(e.target.value)}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="message">Message</Label>
						<Textarea
							id="message"
							ref={messageInputRef}
							placeholder="Please provide more details about your feedback..."
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							rows={4}
						/>
					</div>
				</div>
				<div className="flex justify-end gap-2">
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button
						onClick={() => void handleFeedbackSubmit()}
						disabled={isSubmitting || !subject.trim() || !message.trim()}
					>
						{isSubmitting ? "Sending..." : "Send Feedback"}{" "}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
