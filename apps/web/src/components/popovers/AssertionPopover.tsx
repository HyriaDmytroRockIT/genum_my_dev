import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import PromptActionPopover from "@/components/popovers/PromptActionPopover";
import { useMutation } from "@tanstack/react-query";
import { promptApi } from "@/api/prompt";

interface AssertionPopoverProps {
	promptId?: number | string;
	setAssertionValue: (val: string) => void;
	toast: (args: {
		title: string;
		description?: string;
		variant?: "default" | "destructive" | null;
	}) => void;
}

export default function AssertionPopover({
	promptId,
	setAssertionValue,
	toast,
}: AssertionPopoverProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [input, setInput] = useState("");

	const assertionMutation = useMutation({
		mutationFn: async (query: string) => {
			if (!promptId) throw new Error("Prompt ID is required");
			return await promptApi.generateAssertion(promptId, { query });
		},
	});

	const updatePromptMutation = useMutation({
		mutationFn: async (assertionValue: string) => {
			if (!promptId) throw new Error("Prompt ID is required");
			return await promptApi.updatePrompt(promptId, { assertionValue });
		},
	});

	const isLoading = assertionMutation.isPending || updatePromptMutation.isPending;

	return (
		<Popover
			open={isOpen}
			onOpenChange={(open) => {
				setIsOpen(open);
				if (open) setInput("");
			}}
		>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="icon" className="h-6 w-6 [&_svg]:size-5 ml-2">
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
				</Button>
			</PopoverTrigger>
			<PromptActionPopover
				placeholder="What rule do you want to create?"
				value={input}
				onChange={setInput}
				onAction={() => {
					if (!promptId) return;

					assertionMutation.mutate(input, {
						onSuccess: (response) => {
							if (response && response.assertion) {
								setAssertionValue(response.assertion);
								updatePromptMutation.mutate(response.assertion, {
									onSuccess: () => {
										toast({
											title: "Rule sent",
											description: "Your rule was sent successfully",
											variant: "default",
										});
										setIsOpen(false);
									},
									onError: () => {
										toast({
											title: "Error",
											description: "Failed to update prompt",
											variant: "destructive",
										});
									},
								});
							} else {
								toast({
									title: "Rule sent",
									description: "Your rule was sent successfully",
									variant: "default",
								});
								setIsOpen(false);
							}
						},
						onError: () => {
							toast({
								title: "Error",
								description: "Failed to send rule",
								variant: "destructive",
							});
						},
					});
				}}
				buttonText="Generate"
				buttonIcon={
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
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M12.6648 3.27414L12.8176 2.86133L12.9711 3.27414C13.1709 3.81625 13.2712 4.08731 13.4689 4.28507C13.6658 4.48193 13.9365 4.58219 14.4768 4.78231L14.4785 4.78293L14.892 4.93574L14.4792 5.08925C13.9371 5.28908 13.666 5.38935 13.4683 5.58711C13.2712 5.78418 13.1709 6.05523 12.9704 6.59734L12.9704 6.59735L12.8176 7.01016L12.6641 6.59735C12.4642 6.05523 12.364 5.78418 12.1662 5.58642C11.9693 5.38955 11.6986 5.28929 11.1583 5.08918L11.1567 5.08856L10.7432 4.93574L11.156 4.78224C11.6981 4.5824 11.9691 4.48214 12.1669 4.28438C12.364 4.08731 12.4642 3.81625 12.6648 3.27415L12.6648 3.27414Z"
								stroke="currentColor"
								strokeWidth="0.7"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</g>
					</svg>
				}
				loading={isLoading}
				disabled={isLoading}
				textareaClassName="text-foreground text-[14px] font-normal leading-[20px]"
				allowEmpty={true}
			/>
		</Popover>
	);
}
