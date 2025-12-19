import { useState, useEffect } from "react";
import { useUserStore } from "@/stores/user.store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
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
import { useToast } from "@/hooks/useToast";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { userApi } from "@/api/user";

export default function UserProfile() {
	const userData = useUserStore((state) => state.userData);
	const loading = useUserStore((state) => state.loading);
	const updateUser = useUserStore((state) => state.updateUser);
	const { toast } = useToast();

	// Profile editing state
	const [name, setName] = useState("");
	const [modalName, setModalName] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Feedback state
	const [feedbackOpen, setFeedbackOpen] = useState(false);
	const [feedbackType, setFeedbackType] = useState("Question");
	const [feedbackSubject, setFeedbackSubject] = useState("");
	const [feedbackMessage, setFeedbackMessage] = useState("");
	const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);

	const feedbackTypes = ["Question", "Report bug", "Feature request", "Other"];

	useEffect(() => {
		if (userData?.name) {
			setName(userData.name);
		}
	}, [userData]);

	const handleModalOpenChange = (open: boolean) => {
		setIsModalOpen(open);
		if (open) {
			setModalName(name);
		}
	};

	const updateUserName = async () => {
		setIsSubmitting(true);
		try {
			await userApi.updateUser({ name: modalName });

			toast({
				title: "Success",
				description: "Your name has been updated successfully.",
				variant: "default",
			});

			setName(modalName);
			updateUser({ name: modalName });
			setIsModalOpen(false);
		} catch (error) {
			console.error("Error updating user name:", error);
			toast({
				title: "Error",
				description: "Failed to update your name. Please try again.",
				variant: "destructive",
			});
		}
	};

	const handleModalClose = () => {
		setIsModalOpen(false);
		setName(userData?.name || "");
	};

	const handleFeedbackSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!feedbackSubject.trim() || !feedbackMessage.trim()) {
			return;
		}

		setIsFeedbackSubmitting(true);
		try {
			const apiType = feedbackType.toLowerCase().replace(/ /g, "_");

			await userApi.sendFeedback({
				type: apiType,
				subject: feedbackSubject.trim(),
				message: feedbackMessage.trim(),
			});

			toast({
				title: "Feedback sent",
				description: "Thank you for your feedback!",
				duration: 3000,
			});

			setFeedbackOpen(false);
			setFeedbackType("Question");
			setFeedbackSubject("");
			setFeedbackMessage("");
		} catch (error) {
			console.error("Error sending feedback:", error);
			toast({
				title: "Error",
				description: "Failed to send feedback. Please try again.",
				variant: "destructive",
				duration: 3000,
			});
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center p-6">
				<div className="h-6 w-6 animate-spin text-gray-500" />
				<span className="ml-2 text-sm text-gray-500">Loading user data...</span>
			</div>
		);
	}

	return (
		<Card className="rounded-md shadow-none w-full">
			<CardHeader className="flex flex-row items-center justify-between max-w-[724px] space-y-0 pb-4">
				<CardTitle className="font-medium text-[18px] dark:text-[#fff] leading-[28px]">
					General
				</CardTitle>
				<Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
					<DialogTrigger asChild>
						<Button variant="outline" size="sm" className="h-[32px]">
							Edit
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Edit Profile</DialogTitle>
							<DialogDescription>
								Make changes to your profile here. Click save when you're done.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-2">
							<div className="space-y-2">
								<Label
									htmlFor="modal-name"
									className="text-sm text-[#18181B] dark:text-[#FAFAFA]"
								>
									Name
								</Label>
								<Input
									id="modal-name"
									placeholder="Name Surname"
									value={modalName}
									onChange={(e) => setModalName(e.target.value)}
								/>
								<p className="text-sm text-muted-foreground">
									The name associated with this account
								</p>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={handleModalClose}>
								Cancel
							</Button>
							<Button
								onClick={updateUserName}
								disabled={isSubmitting || modalName === name}
							>
								{isSubmitting ? "Saving..." : "Save changes"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</CardHeader>

			<CardContent className="space-y-5 max-w-[724px]">
				<div className="space-y-1.5">
					<Label htmlFor="name" className="text-sm text-[#18181B] dark:text-[#FAFAFA]">
						Name
					</Label>
					<Input
						id="name"
						placeholder="Name Surname"
						value={name || ""}
						disabled
						className="bg-[#F4F4F5] text-zinc-500"
					/>
					<p className="text-sm text-muted-foreground">
						The name associated with this account
					</p>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="email" className="text-sm text-[#18181B] dark:text-[#FAFAFA]">
						Email address
					</Label>
					<Input
						id="email"
						type="email"
						placeholder="johnsmith@mail.com"
						className="bg-[#F4F4F5] text-zinc-500"
						disabled
						defaultValue={userData?.email || ""}
					/>
					<p className="text-sm text-muted-foreground">
						The email address associated with this account
					</p>
				</div>
			</CardContent>

			<CardHeader className="pt-2 pb-5 max-w-[724px]">
				<CardTitle className="font-medium text-[18px] leading-[28px]">Theme</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2 max-w-[724px]">
				<ModeToggle />
			</CardContent>

			<CardHeader className="pt-2 pb-5 max-w-[724px]">
				<CardTitle className="font-medium text-[18px] leading-[28px]">Security</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2 max-w-[724px]">
				<p className="text-sm font-bold text-[#437BEF] mb-1">Coming soon</p>
				<p className="text-sm font-bold text-zinc-500 mb-1">
					Multi-factor authentication (MFA)
				</p>
				<p className="text-sm text-zinc-500 mb-4">
					Require an extra security challenge when logging in. If you are unable to pass
					this challenge, you will have the option to recover your account via email.
				</p>
				<Button disabled>Enable MFA</Button>
			</CardContent>

			<CardHeader className="py-2 max-w-[724px]">
				<CardTitle className="font-medium text-[18px] leading-[28px]">
					Help & Feedback
				</CardTitle>
			</CardHeader>
			<CardContent className="max-w-[724px]">
				<p className="text-sm text-zinc-500 mb-4">
					We value your feedback to improve our platform.
				</p>
				<Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
					<DialogTrigger asChild>
						<Button className="text-[14px] h-[36px] mt-0">Send Feedback</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[500px]">
						<DialogHeader>
							<DialogTitle>Send Feedback</DialogTitle>
							<DialogDescription>
								Help us improve! Send your feedback, questions, or bug reports.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleFeedbackSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="feedback-type">Type</Label>
								<Select value={feedbackType} onValueChange={setFeedbackType}>
									<SelectTrigger className="text-sm" id="feedback-type">
										<SelectValue placeholder="Select feedback type" />
									</SelectTrigger>
									<SelectContent>
										{feedbackTypes.map((type) => (
											<SelectItem key={type} value={type}>
												{type}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label htmlFor="feedback-subject">Subject</Label>
									<span className="text-xs text-gray-500">
										{feedbackSubject.length}/128
									</span>
								</div>
								<Input
									id="feedback-subject"
									placeholder="Brief description of your feedback"
									value={feedbackSubject}
									onChange={(e) =>
										setFeedbackSubject(e.target.value.slice(0, 128))
									}
									required
									maxLength={128}
								/>
							</div>

							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label htmlFor="feedback-message">Message</Label>
									<span className="text-xs text-gray-500">
										{feedbackMessage.length}/2500
									</span>
								</div>
								<Textarea
									id="feedback-message"
									placeholder="Provide details about your feedback..."
									rows={5}
									value={feedbackMessage}
									onChange={(e) =>
										setFeedbackMessage(e.target.value.slice(0, 2500))
									}
									required
									maxLength={2500}
								/>
							</div>

							<div className="flex justify-end gap-3 mt-6">
								<Button
									type="button"
									variant="outline"
									onClick={() => setFeedbackOpen(false)}
									disabled={isFeedbackSubmitting}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={
										isFeedbackSubmitting ||
										!feedbackSubject.trim() ||
										!feedbackMessage.trim()
									}
								>
									{isFeedbackSubmitting ? "Sending..." : "Send Feedback"}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</CardContent>
		</Card>
	);
}
