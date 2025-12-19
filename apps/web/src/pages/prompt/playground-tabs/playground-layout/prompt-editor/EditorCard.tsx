import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BarChart2, LoaderCircle } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { EditorContent } from "@tiptap/react";
import PromptActionPopover from "@/components/popovers/PromptActionPopover";
import {
	TextBolder,
	TextItalic,
	TextHOne,
	TextHTwo,
	TextHThree,
	TextHFour,
	TextHFive,
	TextHSix,
	ListBullets,
	ListNumbers,
	Eye,
	EyeClosed,
	CornersOut,
} from "phosphor-react";
import { cn } from "@/lib/utils";
import Brush from "@/assets/brush.svg";
import { useState, useEffect } from "react";
import { useTooltipsEnabledOnExpand } from "@/hooks/useEditorViewState";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useMarkdownHeadingComponentsWithScroll, getMarkdownTocItems } from "@/hooks/useTOC";

interface EditorCardProps {
	title: string;
	editor: any;
	isExpanded: boolean;
	setIsExpanded: (value: boolean) => void;
	main?: boolean;
	promptText?: string;
	setPromptText?: (value: string) => void;
	tuneText?: string;
	setTuneText?: (value: string) => void;
	loading?: boolean;
	handleUndo: () => void;
	handleRedo: () => void;
	handleGenerate?: () => void;
	handleTune?: () => void;
	clearContent?: () => void;
	tokens?: {
		prompt: number;
		completion: number;
		total: number;
	} | null;
	cost?: {
		prompt: number;
		completion: number;
		total: number;
	} | null;
	responseTime?: number | null;
	onAuditPrompt?: () => void;
	onOpenAuditModal?: () => void;
	isAuditLoading?: boolean;
	canAudit?: boolean;
	auditRate?: number;
	handleUppercase?: () => void;
	children?: React.ReactNode;
	isMarkdownPreview?: boolean;
	onToggleMarkdownPreview?: () => void;
	editorHeight?: number;
	setEditorHeight?: (height: number) => void;
}

const EditorCard = ({
	title,
	editor,
	isExpanded,
	setIsExpanded,
	main,
	promptText = "",
	setPromptText = () => {},
	tuneText = "",
	setTuneText = () => {},
	loading = false,
	handleGenerate = () => {},
	handleTune = () => {},
	clearContent = () => {},
	onAuditPrompt,
	onOpenAuditModal,
	isAuditLoading = false,
	canAudit = false,
	auditRate,
	children,
	isMarkdownPreview = false,
	onToggleMarkdownPreview,
	editorHeight,
	setEditorHeight,
}: EditorCardProps) => {
	const [isGeneratePopoverOpen, setIsGeneratePopoverOpen] = useState(false);
	const [isTunePopoverOpen, setIsTunePopoverOpen] = useState(false);
	const [wasLoading, setWasLoading] = useState(false);
	const tooltipsEnabled = useTooltipsEnabledOnExpand(isExpanded, 300);
	const [isResizing, setIsResizing] = useState(false);
	const [startY, setStartY] = useState(0);
	const [startHeight, setStartHeight] = useState(0);

	useEffect(() => {
		if (wasLoading && !loading) {
			setIsGeneratePopoverOpen(false);
			setIsTunePopoverOpen(false);
		}
		setWasLoading(loading);
	}, [loading, wasLoading]);

	useEffect(() => {
		if (!isResizing || isExpanded) return;
		const handleMouseMove = (e: MouseEvent) => {
			if (setEditorHeight) {
				const newHeight = Math.max(130, startHeight + (e.clientY - startY));
				setEditorHeight(newHeight);
			}
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
	}, [isResizing, isExpanded, setEditorHeight, startHeight, startY]);

	const handleAuditClick = () => {
		if (auditRate !== undefined && onOpenAuditModal) {
			onOpenAuditModal();
		} else if (onAuditPrompt) {
			onAuditPrompt();
		}
	};

	const handleGenerateClick = () => {
		handleGenerate();
	};

	const handleTuneClick = () => {
		handleTune();
	};

	const tocItems = editor && editor.value ? getMarkdownTocItems(editor.value) : [];
	const headingComponents = useMarkdownHeadingComponentsWithScroll(tocItems);

	return (
		<div
			className={cn(
				"w-full tailwind-list-reset",
				!editorHeight && "h-full flex flex-col min-h-0",
			)}
		>
			<Card
				className={cn(
					"border-0 rounded-lg shadow-none",
					!editorHeight && "h-full flex flex-col min-h-0 dark:bg-[#313135]",
				)}
			>
				<CardHeader className="flex flex-row items-center justify-between p-0 pb-2 bg-background space-y-0 dark:bg-transparent">
					<div className="flex items-center gap-3">
						<CardTitle className="text-sm font-medium">{title}</CardTitle>
					</div>

					<div>
						{!isExpanded && (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6 [&_svg]:size-3 text-[#09090B] dark:text-[#FAFAFA]"
											onClick={() => setIsExpanded(true)}
										>
											<CornersOut style={{ width: "20px", height: "20px" }} />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>Expand</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						)}
					</div>
				</CardHeader>

				<div
					className={cn(
						"border shadow-sm rounded-md",
						!editorHeight && "flex flex-col h-full min-h-0",
					)}
				>
					<div className="px-2 py-1.5 bg-muted dark:bg-[#27272A] rounded-t-md">
						<div className="flex flex-wrap items-center gap-1">
							<div className="flex justify-between w-full">
								<div className="flex">
									<TooltipProvider>
										{tooltipsEnabled ? (
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="h-6 w-6"
														onClick={() => editor.commands.toggleBold()}
														onMouseDown={(e) => e.preventDefault()}
													>
														<TextBolder
															style={{
																width: "15px",
																height: "15px",
															}}
														/>
													</Button>
												</TooltipTrigger>
												<TooltipContent>
													<p>Bold</p>
												</TooltipContent>
											</Tooltip>
										) : (
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6"
												onClick={() => editor.commands.toggleBold()}
											>
												<TextBolder
													style={{ width: "15px", height: "15px" }}
												/>
											</Button>
										)}
									</TooltipProvider>

									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="h-6 w-6"
													onClick={() => editor.commands.toggleItalic()}
													onMouseDown={(e) => e.preventDefault()}
												>
													<TextItalic
														style={{ width: "15px", height: "15px" }}
													/>
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>Italic</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>

									<Separator orientation="vertical" className="mx-1 h-6" />

									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className={"h-6 w-6"}
													onClick={() =>
														editor.commands.toggleHeading({ level: 1 })
													}
													onMouseDown={(e) => e.preventDefault()}
												>
													<TextHOne
														style={{ width: "19px", height: "19px" }}
													/>
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>Heading 1</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>

									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className={"h-6 w-6"}
													onClick={() =>
														editor.commands.toggleHeading({ level: 2 })
													}
													onMouseDown={(e) => e.preventDefault()}
												>
													<TextHTwo
														style={{ width: "19px", height: "19px" }}
													/>
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>Heading 2</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>

									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className={"h-6 w-6"}
													onClick={() =>
														editor.commands.toggleHeading({ level: 3 })
													}
													onMouseDown={(e) => e.preventDefault()}
												>
													<TextHThree
														style={{ width: "19px", height: "19px" }}
													/>
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>Heading 3</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>

									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className={"h-6 w-6"}
													onClick={() =>
														editor.commands.toggleHeading({ level: 4 })
													}
													onMouseDown={(e) => e.preventDefault()}
												>
													<TextHFour
														style={{ width: "19px", height: "19px" }}
													/>
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>Heading 4</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>

									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className={"h-6 w-6"}
													onClick={() =>
														editor.commands.toggleHeading({ level: 5 })
													}
													onMouseDown={(e) => e.preventDefault()}
												>
													<TextHFive
														style={{ width: "19px", height: "19px" }}
													/>
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>Heading 5</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>

									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className={"h-6 w-6"}
													onClick={() =>
														editor.commands.toggleHeading({ level: 6 })
													}
													onMouseDown={(e) => e.preventDefault()}
												>
													<TextHSix
														style={{ width: "19px", height: "19px" }}
													/>
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>Heading 6</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>

									<Separator orientation="vertical" className="mx-1 h-6" />

									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="h-6 w-6"
													onClick={() => editor.commands.toggleList()}
													onMouseDown={(e) => e.preventDefault()}
												>
													<ListBullets
														style={{ width: "18px", height: "18px" }}
													/>
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>Bullet List</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>

									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="h-6 w-6"
													onClick={() =>
														editor.commands.toggleOrderedList()
													}
													onMouseDown={(e) => e.preventDefault()}
												>
													<ListNumbers
														style={{ width: "18px", height: "18px" }}
													/>
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>Numbered List</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>

									<Separator orientation="vertical" className="mx-1 h-6" />

									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="h-6 w-6"
													onClick={onToggleMarkdownPreview}
													aria-label={
														isMarkdownPreview
															? "Hide Preview"
															: "Show Preview"
													}
													onMouseDown={(e) => e.preventDefault()}
												>
													{isMarkdownPreview ? (
														<EyeClosed
															style={{
																width: "18px",
																height: "18px",
															}}
														/>
													) : (
														<Eye
															style={{
																width: "18px",
																height: "18px",
															}}
														/>
													)}
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>
													{isMarkdownPreview
														? "Hide Preview"
														: "Show Preview"}
												</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>

								<div className="flex items-center gap-3">
									{main && (onAuditPrompt || onOpenAuditModal) && (
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="outline"
														size="sm"
														onClick={handleAuditClick}
														disabled={!canAudit || isAuditLoading}
														className={cn(
															"border-[#437BEF] dark:border-[#437BEF] bg-transparent text-[#437BEF] [&_svg]:size-3 hover:text-[#437BEF] text-[10px] gap-0.5 px-[10px] h-[20px]",
															auditRate !== undefined
																? "cursor-pointer"
																: "",
														)}
													>
														{isAuditLoading ? (
															<LoaderCircle className="h-3 w-3 animate-spin" />
														) : (
															<></>
														)}
														{typeof auditRate === "number" ? (
															<>
																<BarChart2 className="h-4 w-4" />
																Score {auditRate}/100
															</>
														) : (
															"Audit"
														)}
													</Button>
												</TooltipTrigger>
												<TooltipContent>
													<p>
														{auditRate !== undefined
															? "View audit results"
															: "Analyze prompt logic"}
													</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									)}
									{editor && editor.isEmpty && main && (
										<Popover
											open={isGeneratePopoverOpen}
											onOpenChange={setIsGeneratePopoverOpen}
										>
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<PopoverTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																className="h-6 w-6 text-[#437BEF] hover:bg-accent hover:text-accent-foreground dark:hover:text-white [&_svg]:size-5"
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
													</TooltipTrigger>
													<TooltipContent>
														<p>Generate prompt</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>

											<PromptActionPopover
												placeholder="What would you like to generate?"
												value={promptText}
												onChange={setPromptText}
												onAction={handleGenerateClick}
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
												loading={loading}
												disabled={promptText.trim() === ""}
											/>
										</Popover>
									)}
									{editor && !editor.isEmpty && main && (
										<Popover
											open={isTunePopoverOpen}
											onOpenChange={setIsTunePopoverOpen}
										>
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<PopoverTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																className="h-6 w-6 text-[#437BEF] hover:bg-accent hover:text-accent-foreground dark:hover:text-white [&_svg]:size-5"
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
																</svg>
															</Button>
														</PopoverTrigger>
													</TooltipTrigger>
													<TooltipContent>
														<p>Tune prompt</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>

											<PromptActionPopover
												placeholder="What would you like to tune?"
												value={tuneText}
												onChange={setTuneText}
												onAction={handleTuneClick}
												buttonText="Tune"
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
												loading={loading}
												textareaClassName="text-primary"
											/>
										</Popover>
									)}
									{editor && !editor.isEmpty && !main && (
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="h-6 w-6 [&_svg]:size-4"
														onClick={clearContent}
														onMouseDown={(e) => e.preventDefault()}
													>
														<Brush />
													</Button>
												</TooltipTrigger>
												<TooltipContent>
													<p>Clear content</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									)}
								</div>
							</div>
						</div>
					</div>

					<CardContent
						className={cn(
							"p-0 text-xs overflow-hidden rounded-bl-lg",
							!editorHeight && "flex-1 h-full min-h-0 flex flex-col",
						)}
						style={
							editorHeight
								? {
										height: `${editorHeight}px`,
										minHeight: 130,
										paddingTop: 0,
										paddingBottom: 0,
									}
								: {
										minHeight: 130,
										paddingTop: 0,
										paddingBottom: 0,
									}
						}
					>
						{isMarkdownPreview ? (
							<div
								className={cn(
									"text-sm max-w-full min-w-0 break-words break-all whitespace-pre-wrap overflow-auto [&_pre]:overflow-auto [&_pre]:whitespace-pre-wrap [&_code]:break-words",
									!editorHeight && "h-full min-h-0 flex-1",
								)}
								style={editorHeight ? { height: `${editorHeight}px` } : {}}
							>
								<ReactMarkdown
									remarkPlugins={[remarkGfm]}
									components={headingComponents}
								>
									{editor.value || ""}
								</ReactMarkdown>
							</div>
						) : (
							<div
								className={cn(
									!editorHeight && "h-full min-h-0 flex-1 flex flex-col",
								)}
							>
								{children ? children : <EditorContent editor={editor} />}
							</div>
						)}
					</CardContent>
					<div className="relative w-full">
						<div className="w-full h-px bg-border" />
						{!isExpanded && (
							<div
								className="absolute right-0 bottom-0 w-4 h-4 cursor-ns-resize flex items-end justify-end select-none bg-transparent z-10"
								onMouseDown={(e) => {
									setIsResizing(true);
									setStartY(e.clientY);
									setStartHeight(editorHeight || 130);
									e.stopPropagation();
								}}
								style={{ userSelect: "none" }}
								aria-label="Resize editor"
								role="slider"
								tabIndex={0}
							>
								<div className="w-[13px] h-[13px] flex items-end justify-end">
									<svg
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
										fill="#000000"
										stroke="#000000"
										strokeWidth="0.00024000000000000003"
										className="opacity-70"
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
						)}
					</div>
				</div>
			</Card>
		</div>
	);
};

export default EditorCard;
