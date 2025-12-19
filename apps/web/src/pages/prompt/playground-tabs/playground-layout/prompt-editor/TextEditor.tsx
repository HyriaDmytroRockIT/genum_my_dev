import { useRef, memo, useState, useEffect, useCallback } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import EditorCard from "./EditorCard";
import { toast } from "@/hooks/useToast";
import PromptDiff from "@/components/dialogs/PromptDiffDialog";
import TableOfContents from "@/components/ui/TableOfContents";
import { useMarkdownTOC, useScrollToAnchor } from "@/hooks/useTOC";
import Editor from "@monaco-editor/react";
import { useMonacoEditor } from "@/hooks/useMonacoEditor";
import { usePromptTune } from "@/hooks/usePromptTune";
import { useEditorViewState } from "@/hooks/useEditorViewState";
import { useMarkdownScrollToHeading } from "@/hooks/useMarkdownScrollToHeading";
import { usePromptDiffDialog } from "@/hooks/usePromptDiffDialog";
import { useAutoFocusEditorOnExpand } from "@/hooks/useEditorViewState";
import { useTheme } from "@/components/theme/theme-provider";
import { usePlaygroundContent, usePlaygroundActions } from "@/stores/playground.store";

interface TextEditorProps {
	title: string;
	main?: boolean;
	onUpdatePrompt: (
		content: string,
		options?: {
			isEmpty?: boolean;
			isWithoutUpdate: boolean;
			isFormattingOnly?: boolean;
		},
	) => void;
	testcaseInput?: string;
	expectedContent?: any;
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
	isPromptInstructionsEditor?: boolean;
}

const TextEditor = ({
	title,
	main,
	onUpdatePrompt,
	testcaseInput,
	expectedContent,
	tokens,
	cost,
	responseTime,
	onAuditPrompt,
	onOpenAuditModal,
	isAuditLoading = false,
	canAudit = false,
	auditRate,
	isPromptInstructionsEditor,
}: TextEditorProps) => {
	const { originalPromptContent, livePromptValue } = usePlaygroundContent();
	const { setOriginalPromptContent, setLivePromptValue } = usePlaygroundActions();
	const lastSavedValueRef = useRef<string>(originalPromptContent ?? "");

	useEffect(() => {
		// Sync ref when content changes from outside
		if (originalPromptContent !== lastSavedValueRef.current) {
			lastSavedValueRef.current = originalPromptContent ?? "";
		}
	}, [originalPromptContent]);

	const editorContainerRef = useRef<HTMLDivElement>(null);
	const [editorHeight, setEditorHeight] = useState<number>(200);

	const { resolvedTheme } = useTheme();
	const monacoTheme = resolvedTheme === "dark" ? "vs-dark" : "vs";

	const {
		isExpanded,
		setIsExpanded,
		handleExpandToggle,
		isMarkdownPreview,
		handleMarkdownPreviewToggle,
		hasSavedOnClose,
	} = useEditorViewState();

	const handleContentChange = useCallback(
		(value: string) => {
			setLivePromptValue(value);
		},
		[setLivePromptValue],
	);

	const handleBlur = useCallback(
		(value: string) => {
			if (value !== lastSavedValueRef.current) {
				onUpdatePrompt(value, {
					isEmpty: !value.trim(),
					isWithoutUpdate: false,
				});
				lastSavedValueRef.current = value;
				setOriginalPromptContent(value);
			}
		},
		[onUpdatePrompt, setOriginalPromptContent],
	);

	const mainEditor = useMonacoEditor({
		initialValue: originalPromptContent ?? "",
		onContentChange: handleContentChange,
		onBlur: handleBlur,
		onSaveOnCloseRef: hasSavedOnClose,
	});

	const fullscreenEditor = useMonacoEditor({
		initialValue: originalPromptContent ?? "",
		onContentChange: handleContentChange,
		onBlur: handleBlur,
		onSaveOnCloseRef: hasSavedOnClose,
	});

	useEffect(() => {
		if (isExpanded) return;
		const initialValue = originalPromptContent ?? "";
		setLivePromptValue(initialValue);
		if (mainEditor.editorValueRef.current !== initialValue) {
			mainEditor.handleEditorChange(initialValue);
		}
		if (fullscreenEditor.editorValueRef.current !== initialValue) {
			fullscreenEditor.handleEditorChange(initialValue);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [originalPromptContent, isExpanded]);

	const promptDiffDialog = usePromptDiffDialog(
		(value, options) => {
			setOriginalPromptContent(value);
			onUpdatePrompt(value, { isWithoutUpdate: false, ...options });
		},
		mainEditor.editorValueRef,
		mainEditor.editorRef,
		(value, options) => {
			onUpdatePrompt(value, { isWithoutUpdate: false, ...options });
		},
	);

	const {
		promptText,
		setPromptText,
		tuneText,
		setTuneText,
		handleGenerate,
		handleTune,
		loading: promptTuneLoading,
		promptTuneMutation,
	} = usePromptTune({
		editorValue: mainEditor.editorValueRef.current,
		testcaseInput,
		currentInputContent: originalPromptContent,
		expectedContent,
		onContentChange: (value: string) => {
			setOriginalPromptContent(value);
			onUpdatePrompt(value, { isWithoutUpdate: false });
		},
		setIsExpanded,
		toast,
		setIsOpenPromptDiff: promptDiffDialog.setIsOpenPromptDiff,
	});

	const tocItems = useMarkdownTOC(livePromptValue);
	const scrollToHeading = useMarkdownScrollToHeading({
		editorRef: fullscreenEditor.editorRef,
	});
	const scrollToAnchor = useScrollToAnchor({ block: "start" });

	useAutoFocusEditorOnExpand(isExpanded, fullscreenEditor.editorRef);

	const renderEditorCard = (
		editorInstance: ReturnType<typeof useMonacoEditor>,
		isFullscreen = false,
	) => {
		const {
			editorValueRef,
			handleEditorChange,
			handleEditorDidMount,
			handleStyle,
			handleUppercase,
			handleUndo,
			handleRedo,
		} = editorInstance;

		return (
			<EditorCard
				title={title}
				editor={{
					value: editorValueRef.current,
					isEmpty: !editorValueRef.current.trim(),
					commands: {
						toggleBold: () => handleStyle("bold"),
						toggleItalic: () => handleStyle("italic"),
						toggleUnderline: () => handleStyle("underline"),
						toggleHeading: ({ level }: { level: number }) =>
							handleStyle("heading", level),
						toggleUppercase: handleUppercase,
						toggleList: () => handleStyle("list"),
						toggleOrderedList: () => handleStyle("orderedList"),
					},
				}}
				isExpanded={isExpanded}
				setIsExpanded={handleExpandToggle}
				main={main}
				promptText={promptText}
				setPromptText={setPromptText}
				tuneText={tuneText}
				setTuneText={setTuneText}
				loading={promptTuneLoading}
				handleUndo={handleUndo}
				handleRedo={handleRedo}
				handleGenerate={handleGenerate}
				handleTune={handleTune}
				clearContent={() => {
					handleEditorChange("");
					setOriginalPromptContent("");
					onUpdatePrompt("", { isEmpty: true, isWithoutUpdate: false });
				}}
				tokens={tokens}
				cost={cost}
				responseTime={responseTime}
				onAuditPrompt={onAuditPrompt}
				onOpenAuditModal={onOpenAuditModal}
				isAuditLoading={isAuditLoading}
				canAudit={canAudit}
				auditRate={auditRate}
				handleUppercase={handleUppercase}
				isMarkdownPreview={isMarkdownPreview}
				onToggleMarkdownPreview={handleMarkdownPreviewToggle}
				editorHeight={isFullscreen ? undefined : editorHeight}
				setEditorHeight={setEditorHeight}
			>
				{!isMarkdownPreview && (
					<Editor
						height={isFullscreen ? "100%" : `${editorHeight}px`}
						defaultLanguage="markdown"
						value={editorValueRef.current}
						onChange={handleEditorChange}
						onMount={handleEditorDidMount}
						width={"100%"}
						options={{
							minimap: { enabled: false },
							wordWrap: "on",
							fontSize: 14,
							lineNumbers: "off",
							scrollBeyondLastLine: false,
							padding: { top: 8, bottom: 8 },
							overviewRulerBorder: false,
							renderLineHighlight: "none",
							scrollbar: {
								vertical: "auto",
								horizontal: "auto",
								verticalScrollbarSize: 5,
							},
							tabSize: 2,
							cursorBlinking: "smooth",
							renderValidationDecorations: "off",
							contextmenu: false,
							ariaLabel: title,
							hideCursorInOverviewRuler: true,
							cursorStyle: "line-thin",
							fontFamily: "Inter, sans-serif",
							accessibilitySupport: "off",
							stickyScroll: {
								enabled: false,
							},
							quickSuggestions: false,
							suggestOnTriggerCharacters: false,
							parameterHints: {
								enabled: false,
							},
							automaticLayout: true,
						}}
						theme={monacoTheme}
					/>
				)}
			</EditorCard>
		);
	};

	return (
		<>
			<div
				ref={editorContainerRef}
				tabIndex={-1}
				className="relative"
				onBlur={(e) => {
					if (!e.currentTarget.contains(e.relatedTarget)) {
						mainEditor.handleEditorBlur();
					}
				}}
			>
				{renderEditorCard(mainEditor)}
			</div>

			<Dialog
				open={isExpanded}
				onOpenChange={(open) => {
					if (open) {
						const val = mainEditor.editorValueRef.current;
						fullscreenEditor.editorRef.current?.setValue(val);
						fullscreenEditor.editorValueRef.current = val;
						setIsExpanded(true);
					} else {
						const val = fullscreenEditor.editorValueRef.current;
						mainEditor.editorRef.current?.setValue(val);
						mainEditor.editorValueRef.current = val;
						fullscreenEditor.handleEditorBlur();
						mainEditor.handleEditorBlur();
						setIsExpanded(false);
					}
				}}
			>
				<DialogContent
					onEscapeKeyDown={(e) => e.preventDefault()}
					className="max-w-6xl w-full h-[80vh] min-h-[500px] py-6 px-4 flex flex-col"
					onMouseDown={(e) => {
						const target = e.target as HTMLElement;
						const editorElement = fullscreenEditor.editorRef.current?.getDomNode();
						if (editorElement && !editorElement.contains(target)) {
							fullscreenEditor.handleEditorBlur();
						}
					}}
				>
					<VisuallyHidden>
						<DialogTitle>DialogTitle</DialogTitle>
						<DialogDescription>DialogDescription</DialogDescription>
					</VisuallyHidden>
					<div className="flex-1 flex flex-row w-full gap-6 min-h-0">
						<div className="flex flex-col h-full min-h-0" style={{ width: "80%" }}>
							{renderEditorCard(fullscreenEditor, true)}
						</div>
						<div className="text-sm text-gray-800 flex flex-col gap-[6px] pt-16 max-w-[195px] w-full min-h-0 flex-1">
							<div className="flex-1 min-h-0 flex flex-col">
								<TableOfContents
									items={tocItems}
									onItemClick={scrollToHeading}
									className="max-h-[69vh] overflow-y-auto overflow-x-hidden"
								/>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			<PromptDiff
				isOpen={promptDiffDialog.isOpenPromptDiff}
				onOpenChange={promptDiffDialog.setIsOpenPromptDiff}
				original={mainEditor.editorValueRef.current}
				modified={promptTuneMutation.data?.prompt ?? ""}
				chainOfThoughts={promptTuneMutation.data?.chainOfThoughts ?? ""}
				isLoading={false}
				onSave={promptDiffDialog.onSaveTune}
			/>
		</>
	);
};

export default memo(TextEditor);
