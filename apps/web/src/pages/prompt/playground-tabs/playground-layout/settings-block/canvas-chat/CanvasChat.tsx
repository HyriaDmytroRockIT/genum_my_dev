import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useParams } from "react-router-dom";
import { Button, ButtonWithLoader } from "@/components/ui/button";
import Brush from "@/assets/brush.svg";
import Expand from "@/assets/expand.svg";
import Compress from "@/assets/compress.svg";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/useToast";
import CanvasChatUI from "./CanvasChatUI";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import useQueryWithAuth from "@/hooks/useQueryWithAuth";
import { useQueryClient } from "@tanstack/react-query";
import { promptApi } from "@/api/prompt";
import {
	Action,
	GetMessageResponse,
	Message,
	SendMessageAgentResponse as CanvasSendMessageAgentResponse,
} from "@/types/Canvas";
import AuditResultsModal from "@/components/dialogs/AuditResultsDialog";
import PromptDiff from "@/components/dialogs/PromptDiffDialog";
import useAuditDataModal from "@/hooks/useAuditDataModal";

interface DiffModalInfo {
	prompt: string;
}

interface CanvasChatProps {
	systemPrompt: string;
	updatePromptContent: (value: string) => void;
}

const CanvasChat = ({ systemPrompt, updatePromptContent }: CanvasChatProps) => {
	const [isModalMode, setIsModalMode] = useState(false);

	const [isOpen, setIsOpen] = useState(true);
	const [message, setMessage] = useState("");
	const [mode, setMode] = useState("agent");
	const [isLoading, setIsLoading] = useState(false);
	const [isRecording, setIsRecording] = useState(false);
	const messagesRef = useRef<HTMLDivElement>(null);
	const [showAuditModal, setShowAuditModal] = useState(false);

	const { id } = useParams<{ id: string }>();
	const promptId = id ? Number(id) : undefined;
	const { toast } = useToast();
	const [diffModalInfo, setDiffModalInfo] = useState<DiffModalInfo | null>(null);
	const { setAuditDataModal } = useAuditDataModal();

	const { data: { messages = [] } = {} } = useQueryWithAuth<GetMessageResponse>({
		keys: ["prompts", `${promptId}`, "agent"],
		queryFn: async () => {
			if (!promptId) throw new Error("Prompt ID is required");
			return await promptApi.getAgentChat(promptId);
		},
	});

	const queryClient = useQueryClient();

	const createNewChatMutation = useMutation({
		mutationFn: async () => {
			if (!promptId) throw new Error("Prompt ID is required");
			return await promptApi.createNewAgentChat(promptId);
		},
	});

	const sendMessageMutation = useMutation<
		CanvasSendMessageAgentResponse,
		Error,
		{ mode: string; query: string }
	>({
		mutationFn: async (data: { mode: string; query: string }) => {
			if (!promptId) throw new Error("Prompt ID is required");
			const result = await promptApi.sendAgentMessage(promptId, data);
			// Ensure response property exists
			return result as CanvasSendMessageAgentResponse;
		},
	});

	const setMessages = useCallback<React.Dispatch<React.SetStateAction<GetMessageResponse>>>(
		(updaterMessages) => {
			queryClient.setQueryData(
				["prompts", `${promptId}`, "agent"],
				(oldMessages: { messages: Message[] }) => {
					if (typeof updaterMessages === "function") {
						return updaterMessages(oldMessages || { messages: [] });
					}

					return updaterMessages || { messages: [] };
				},
			);
		},
		[queryClient, promptId],
	);

	const scrollToBottom = () => {
		messagesRef.current?.scrollBy({
			top: messagesRef.current.scrollHeight,
			behavior: "smooth",
		});
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const sendMessageWithAuth = async (
		messageText: string,
	): Promise<CanvasSendMessageAgentResponse> => {
		try {
			const data = await sendMessageMutation.mutateAsync({
				mode: mode,
				query: messageText,
			});

			return data;
		} catch (error) {
			console.error("Error sending message:", error);
			throw error;
		}
	};

	const sendMessage = async () => {
		if (!message.trim() || isLoading || !promptId) return;
		setMessage("");
		await sendMessageInternal(message.trim());
	};

	const sendMessageWithText = async (text: string) => {
		if (!text.trim() || isLoading || !promptId) return;
		await sendMessageInternal(text.trim());
	};

	const sendMessageInternal = async (messageText: string) => {
		if (!isOpen) {
			setIsOpen(true);
		}

		const userMessage: Message = {
			id: Date.now().toString(),
			message: messageText,
			role: "user",
			timestamp: new Date(),
			type: "text",
		};

		setMessages((prev) => ({
			messages: [...prev.messages, userMessage],
		}));
		setIsLoading(true);

		try {
			const data = await sendMessageWithAuth(userMessage.message);

			if (data.response && Array.isArray(data.response)) {
				data.response.forEach((item, index: number) => {
					let messageText = "";

					if (item.type === "action" && item.action) {
						messageText = item.message || "Action completed";

						if (item.action.type === "audit_prompt" && item.action.value) {
							const audit = item.action.value;
							messageText += `\n\n**Audit Summary:**\n${audit.summary}\n\n**Overall Score: ${audit.rate}/100**`;
						}

						handleAction(item.action);
					} else if (item.type === "text") {
						messageText = item.message || "No message";
					} else {
						messageText = item.message || JSON.stringify(item);
					}

					const agentMessage: Message = {
						id: (Date.now() + index + 1).toString(),
						message: messageText,
						role: "agent",
						timestamp: new Date(),
						type: item.type,
						action:
							item.type === "action" && item.action
								? {
										type: item.action.type,
										value:
											item.action.type === "edit_prompt"
												? item.action.value
												: item.action.type === "audit_prompt"
													? JSON.stringify(item.action.value)
													: "",
									}
								: undefined,
					};
					setMessages((prev) => ({
						messages: [...prev.messages, agentMessage],
					}));
				});
			} else {
				let messageText = "Sorry, I couldn't process your request.";
				let messageType: "text" | "action" = "text";
				let actionData: any = undefined;

				if (typeof data.response === "string") {
					messageText = data.response;
				} else if (
					data.response &&
					typeof data.response === "object" &&
					"message" in data.response
				) {
					messageText = (data.response as any).message || messageText;
					const responseType = (data.response as any).type;
					messageType =
						responseType === "action" || responseType === "text"
							? responseType
							: "text";

					if (responseType === "action" && (data.response as any).action) {
						actionData = (data.response as any).action;
						handleAction(actionData);
					}
				}

				const agentMessage: Message = {
					id: (Date.now() + 1).toString(),
					message: messageText,
					role: "agent",
					timestamp: new Date(),
					type: messageType,
					action: actionData
						? {
								type: actionData.type,
								value:
									actionData.type === "edit_prompt"
										? actionData.value
										: actionData.type === "audit_prompt"
											? JSON.stringify(actionData.value)
											: "",
							}
						: undefined,
				};

				setMessages((prev) => ({
					messages: [...prev.messages, agentMessage],
				}));
			}
		} catch (error) {
			console.error("Error sending message:", error);

			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				message: "Sorry, there was an error processing your request. Please try again.",
				role: "agent",
				timestamp: new Date(),
				type: "text",
			};

			setMessages((prev) => ({
				messages: [...prev.messages, errorMessage],
			}));
		} finally {
			setIsLoading(false);
		}
	};

	const handleAction = (action: Action) => {
		try {
			if (action.type === "edit_prompt") {
				setDiffModalInfo({
					prompt: action.value,
				});
			} else if (action.type === "audit_prompt") {
				setAuditDataModal(action.value);
				setShowAuditModal(true);
			}
		} catch (error) {
			console.error("Error in handleAction:", error);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	const createNewChat = async (_event: React.MouseEvent<HTMLButtonElement>) => {
		try {
			await createNewChatMutation.mutateAsync();
			setMessages({ messages: [] });
		} catch (error) {
			console.error("Error starting new chat:", error);
			toast({
				title: "Error",
				description: "Failed to start new chat",
				variant: "destructive",
				duration: 3000,
			});
		}
	};

	const onChangePromptDiff = (value: string) => {
		if (!diffModalInfo) {
			return;
		}
		setDiffModalInfo((prevState) => ({
			...prevState!,
			prompt: value,
		}));
	};

	const onSavePromptDiff = (value: string) => {
		setDiffModalInfo(null);
		updatePromptContent(value);
	};

	const handleOpenAuditModal = () => {
		setShowAuditModal(true);
	};

	const handleCloseAuditModal = () => {
		setShowAuditModal(false);
	};

	const handleAuditComplete = useCallback((auditData: any) => {}, []);

	return (
		<>
			<div
				onClick={() => setIsOpen(!isOpen)}
				className="cursor-pointer flex items-center justify-between"
			>
				<div className="flex items-center gap-[6px]">
					<h2 className="text-foreground font-sans text-[14px] not-italic font-bold leading-[20px]">
						Chat
					</h2>
					{!!messages.length && (
						<ButtonWithLoader
							variant="secondary"
							size="icon"
							className="h-5 w-5 [&_svg]:size-4 rounded-full text-foreground"
							onClick={(e) => {
								e.stopPropagation();
								createNewChat(e);
							}}
							isWithoutLoader
						>
							<Brush />
						</ButtonWithLoader>
					)}
				</div>

				<div className="flex items-center gap-3">
					{isOpen && (
						<Button
							variant="secondary"
							size="icon"
							className="h-5 w-5 [&_svg]:size-3 text-foreground"
							onClick={(e) => {
								e.stopPropagation();
								setIsModalMode((prevState) => !prevState);
							}}
						>
							<Expand />
						</Button>
					)}

					<button
						className="text-[#18181B] dark:text-white"
						onClick={(e) => {
							e.stopPropagation();
							setIsOpen(!isOpen);
						}}
					>
						{isOpen ? (
							<ChevronUp className="w-4 h-4" />
						) : (
							<ChevronDown className="w-4 h-4" />
						)}
					</button>
				</div>
			</div>
			{isOpen && (
				<div className="h-full flex flex-col">
					<CanvasChatUI
						messagesRef={messagesRef}
						isOpen={isOpen}
						messages={messages}
						isLoading={isLoading}
						message={message}
						setMessage={setMessage}
						handleKeyPress={handleKeyPress}
						mode={mode}
						setMode={setMode}
						isRecording={isRecording}
						setIsRecording={setIsRecording}
						sendMessage={sendMessage}
						sendMessageWithText={sendMessageWithText}
					/>
				</div>
			)}

			<Dialog open={isModalMode} onOpenChange={setIsModalMode} modal>
				<DialogContent isDialogClose={false} className={"max-w-3xl max-h-[90vh] gap-3"}>
					<div className="flex items-center justify-between h-fit">
						<div className="flex items-center gap-2">
							<h2 className="text-lg font-semibold">Canvas Chat</h2>
							{!!messages.length && (
								<Button
									variant="secondary"
									size="icon"
									className="h-5 w-5 [&_svg]:size-4 rounded-full text-foreground"
									onClick={createNewChat}
								>
									<Brush />
								</Button>
							)}
						</div>
						<DialogClose
							aria-label="Close"
							className="rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 text-secondary-foreground shadow-sm hover:bg-secondary/80 bg-transparent text-black"
						>
							<Compress />
						</DialogClose>
					</div>

					<div className="flex flex-col flex-grow overflow-hidden">
						<CanvasChatUI
							isOpen={true}
							messages={messages}
							isLoading={isLoading}
							messagesRef={messagesRef}
							message={message}
							setMessage={setMessage}
							handleKeyPress={handleKeyPress}
							mode={mode}
							setMode={setMode}
							isRecording={isRecording}
							setIsRecording={setIsRecording}
							sendMessage={sendMessage}
							sendMessageWithText={sendMessageWithText}
						/>
					</div>
				</DialogContent>
			</Dialog>

			<PromptDiff
				isOpen={!!diffModalInfo}
				onOpenChange={() => setDiffModalInfo(null)}
				original={systemPrompt}
				modified={diffModalInfo?.prompt ?? ""}
				onChange={onChangePromptDiff}
				onSave={onSavePromptDiff}
			/>

			{promptId !== undefined && (
				<AuditResultsModal
					promptId={promptId}
					promptValue={systemPrompt ?? ""}
					existingAuditData={null}
					isOpen={showAuditModal}
					onClose={handleCloseAuditModal}
					onAuditComplete={handleAuditComplete}
					isDisabledFix={false}
					setDiffModalInfo={setDiffModalInfo}
				/>
			)}
		</>
	);
};

export default CanvasChat;
