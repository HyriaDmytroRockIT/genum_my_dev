import { ChangeEvent, forwardRef, useState, useEffect } from "react";
import { Eye, CornersOut, EyeClosed } from "phosphor-react";

import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import AIPreview from "@/pages/prompt/playground-tabs/playground-layout/input-preview/AIPreview";
import PromptActionPopover from "@/components/PromptActionPopover";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/useToast";
import { promptApi } from "@/api/prompt";
import { usePlaygroundContent, usePlaygroundActions } from "@/stores/playground.store";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { testcasesApi } from "@/api/testcases/testcases.api";

interface InputTextAreaProps {
	onBlur?: () => void;
	promptId?: number;
	systemPrompt?: string;
}

export const InputTextArea = forwardRef<HTMLTextAreaElement, InputTextAreaProps>(
	({ onBlur, promptId, systemPrompt }, ref) => {
		const { inputContent, hasPromptContent, hasInputContent } = usePlaygroundContent();
		const { setInputContent } = usePlaygroundActions();
		const { toast } = useToast();
		const [searchParams] = useSearchParams();
		const testcaseId = searchParams.get("testcaseId");
		const queryClient = useQueryClient();

		const [isExpanded, setExpanded] = useState(false);
		const [isPreviewMode, setPreviewMode] = useState(false);
		const [isAIPopoverOpen, setIsAIPopoverOpen] = useState(false);
		const [isAIPopoverOpenExpanded, setIsAIPopoverOpenExpanded] = useState(false);
		const [aiQuery, setAiQuery] = useState("");
		const [aiQueryExpanded, setAiQueryExpanded] = useState("");
		const [textareaHeight, setTextareaHeight] = useState(140);
		const [isResizing, setIsResizing] = useState(false);
		const [startY, setStartY] = useState(0);
		const [startHeight, setStartHeight] = useState(140);

		const inputMutation = useMutation({
			mutationFn: async (data: { query: string; systemPrompt: string }) => {
				if (!promptId) throw new Error("Prompt ID is required");
				return await promptApi.generateInput(promptId, data);
			},
		});

		useEffect(() => {
			if (!isResizing) return;
			const handleMouseMove = (e: MouseEvent) => {
				const newHeight = Math.max(140, startHeight + (e.clientY - startY));
				setTextareaHeight(newHeight);
			};
			const handleMouseUp = () => {
				setIsResizing(false);
			};
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
			return () => {
				window.removeEventListener("mousemove", handleMouseMove);
				window.removeEventListener("mouseup", handleMouseUp);
			};
		}, [isResizing, startHeight, startY]);

		const handleExpandToggle = () => {
			setExpanded(!isExpanded);
		};

		const handlePreviewToggle = () => {
			setPreviewMode(!isPreviewMode);
		};

		const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
			setInputContent(e.target.value);
		};

		const handleBlur = () => {
			if (onBlur) {
				onBlur();
			}
		};

		const isAIButtonActive = hasPromptContent && !hasInputContent && !!promptId;
		const getInactiveReason = () => {
			if (!hasPromptContent) return "No prompt available";
			if (hasInputContent) return "Input already exists";
			if (!promptId) return "No prompt selected";
			return "";
		};

		const handleGenerateInput = async (
			query: string,
			closePopover: () => void,
			clearQuery: () => void,
		) => {
			if (!promptId) return;

			try {
				const response = await inputMutation.mutateAsync({
					query: query || "",
					systemPrompt: systemPrompt || "",
				});

				if (response && response.input) {
					setInputContent(response.input);

					if (testcaseId) {
						await testcasesApi.updateTestcase(testcaseId, {
							input: response.input,
						});
						await queryClient.invalidateQueries({
							queryKey: ["testcaseById", testcaseId],
						});
					}

					toast({
						title: "Input generated",
						description: "Input was generated successfully",
						variant: "default",
					});
					closePopover();
					clearQuery();
				}
			} catch (e) {
				toast({
					title: "Error",
					description: "Failed to generate and save input",
					variant: "destructive",
				});
			}
		};

		return (
			<>
				<div className="flex flex-col gap-2">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 bg-background p-0">
						<CardTitle className="text-sm font-medium">Input</CardTitle>

						<div className="flex items-center gap-2">
							<Popover open={isAIPopoverOpen} onOpenChange={setIsAIPopoverOpen}>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<span className="inline-block">
												<PopoverTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="h-6 w-6 text-[#437BEF] hover:bg-accent hover:text-accent-foreground dark:hover:text-white [&_svg]:size-5 disabled:opacity-50 disabled:cursor-not-allowed"
														disabled={!isAIButtonActive}
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
															<defs>
																<clipPath id="clip0_6861_24864">
																	<rect
																		width="14"
																		height="14"
																		fill="#FAFAFA"
																		transform="translate(1.5 2.25293)"
																	/>
																</clipPath>
															</defs>
														</svg>
													</Button>
												</PopoverTrigger>
											</span>
										</TooltipTrigger>
										<TooltipContent>
											<p>
												{isAIButtonActive
													? "Generate input with AI"
													: getInactiveReason()}
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<PromptActionPopover
									placeholder="What input do you need?"
									value={aiQuery}
									onChange={setAiQuery}
									onAction={() =>
										handleGenerateInput(
											aiQuery,
											() => setIsAIPopoverOpen(false),
											() => setAiQuery(""),
										)
									}
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
											<defs>
												<clipPath id="clip0_6861_24864">
													<rect
														width="14"
														height="14"
														fill="#FAFAFA"
														transform="translate(1.5 2.25293)"
													/>
												</clipPath>
											</defs>
										</svg>
									}
									loading={inputMutation.isPending}
									disabled={inputMutation.isPending}
									allowEmpty={true}
								/>
							</Popover>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6 text-[#09090B] dark:text-[#FAFAFA] [&_svg]:size-3"
										onClick={handlePreviewToggle}
									>
										{isPreviewMode ? (
											<EyeClosed style={{ width: "17px", height: "17px" }} />
										) : (
											<Eye style={{ width: "17px", height: "17px" }} />
										)}
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Show Preview</p>
								</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6 text-[#09090B] dark:text-[#FAFAFA] [&_svg]:size-3"
										onClick={handleExpandToggle}
									>
										<CornersOut style={{ width: "20px", height: "20px" }} />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Expand</p>
								</TooltipContent>
							</Tooltip>
						</div>
					</CardHeader>
					<div className="relative">
						{isPreviewMode ? (
							<div
								className="overflow-y-auto rounded-md border bg-transparent p-4 text-sm dark:border-border"
								style={{ height: `${textareaHeight}px`, minHeight: "140px" }}
							>
								<AIPreview
									content={inputContent}
									onError={(error) => {
										toast({
											title: "Preview Error",
											description: error,
											variant: "destructive",
										});
									}}
								/>
							</div>
						) : (
							<Textarea
								ref={ref}
								value={inputContent}
								onChange={handleChange}
								onBlur={handleBlur}
								placeholder="Enter your input here..."
								className="resize-none bg-transparent text-[14px] focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 dark:bg-[#1E1E1E] dark:border-border md:text-[14px]"
								style={{ height: `${textareaHeight}px`, minHeight: "200px" }}
							/>
						)}
						<div
							className="absolute right-0 bottom-0 w-4 h-4 cursor-ns-resize flex items-end justify-end select-none bg-transparent z-10"
							onMouseDown={(e) => {
								setIsResizing(true);
								setStartY(e.clientY);
								setStartHeight(textareaHeight);
								e.stopPropagation();
							}}
							style={{ userSelect: "none" }}
							aria-label="Resize textarea"
							role="slider"
							tabIndex={0}
						>
							<div className="w-[13px] h-[13px] flex items-end justify-end">
								<svg
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
									fill="currentColor"
									stroke="currentColor"
									strokeWidth="0.00024000000000000003"
									className="opacity-70 text-[#09090B] dark:text-[#FAFAFA]"
								>
									<g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
									<g
										id="SVGRepo_tracerCarrier"
										strokeLinecap="round"
										strokeLinejoin="round"
									></g>
									<g id="SVGRepo_iconCarrier">
										<path d="M22.354 9.354l-.707-.707-13 13 .707.707zm0 7l-.707-.707-6 6 .707.707z"></path>
										<path fill="none" d="M0 0h24v24H0z"></path>
									</g>
								</svg>
							</div>
						</div>
					</div>
				</div>
				<Dialog open={isExpanded} onOpenChange={handleExpandToggle}>
					<DialogContent
						onEscapeKeyDown={(e) => e.preventDefault()}
						className="flex h-[80vh] w-full max-w-4xl flex-col py-6 px-4"
					>
						<div className="flex h-full flex-col gap-2">
							<div className="flex items-center gap-2">
								<h3 className="text-sm font-medium">Input</h3>
								<Popover
									open={isAIPopoverOpenExpanded}
									onOpenChange={setIsAIPopoverOpenExpanded}
								>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<span className="inline-block">
													<PopoverTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-6 w-6 text-[#437BEF] hover:bg-accent hover:text-accent-foreground dark:hover:text-white [&_svg]:size-5 disabled:opacity-50 disabled:cursor-not-allowed"
															disabled={!isAIButtonActive}
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
																<defs>
																	<clipPath id="clip0_6861_24864">
																		<rect
																			width="14"
																			height="14"
																			fill="#FAFAFA"
																			transform="translate(1.5 2.25293)"
																		/>
																	</clipPath>
																</defs>
															</svg>
														</Button>
													</PopoverTrigger>
												</span>
											</TooltipTrigger>
											<TooltipContent>
												<p>
													{isAIButtonActive
														? "Generate input with AI"
														: getInactiveReason()}
												</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>

									<PromptActionPopover
										placeholder="What input do you need?"
										value={aiQueryExpanded}
										onChange={setAiQueryExpanded}
										onAction={() =>
											handleGenerateInput(
												aiQueryExpanded,
												() => setIsAIPopoverOpenExpanded(false),
												() => setAiQueryExpanded(""),
											)
										}
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
												<defs>
													<clipPath id="clip0_6861_24864">
														<rect
															width="14"
															height="14"
															fill="#FAFAFA"
															transform="translate(1.5 2.25293)"
														/>
													</clipPath>
												</defs>
											</svg>
										}
										loading={inputMutation.isPending}
										disabled={inputMutation.isPending}
										allowEmpty={true}
									/>
								</Popover>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6 text-[#09090B] dark:text-[#FAFAFA] [&_svg]:size-3"
											onClick={handlePreviewToggle}
										>
											{isPreviewMode ? (
												<EyeClosed
													style={{ width: "16px", height: "16px" }}
												/>
											) : (
												<Eye style={{ width: "16px", height: "16px" }} />
											)}
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>Show Preview</p>
									</TooltipContent>
								</Tooltip>
							</div>
							<div className="flex-grow overflow-auto">
								{isPreviewMode ? (
									<div className="h-full overflow-y-auto rounded-md border bg-transparent p-4 text-sm dark:border-border">
										<AIPreview
											content={inputContent}
											onError={(error) => {
												toast({
													title: "Preview Error",
													description: error,
													variant: "destructive",
												});
											}}
										/>
									</div>
								) : (
									<Textarea
										value={inputContent}
										onChange={handleChange}
										onBlur={handleBlur}
										placeholder="Enter your input here..."
										className="h-full resize-y text-[14px] dark:bg-[#1E1E1E] dark:border-border focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 md:text-[14px]"
									/>
								)}
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</>
		);
	},
);
