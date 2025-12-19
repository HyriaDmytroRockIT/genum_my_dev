import { useRef, useCallback, useEffect } from "react";

// Firefox detection
const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");

export function useMonacoEditor({
	initialValue = "",
	onContentChange,
	onBlur,
	onSaveOnCloseRef,
}: {
	initialValue?: string;
	onContentChange?: (value: string) => void;
	onBlur?: (value: string, options?: { isEmpty: boolean; isWithoutUpdate: boolean }) => void;
	onSaveOnCloseRef?: React.MutableRefObject<boolean>;
}) {
	const editorRef = useRef<any>(null);
	const editorValueRef = useRef<string>(initialValue);
	const wasInitialized = useRef(false);

	useEffect(() => {
		editorValueRef.current = initialValue;
		if (editorRef.current && editorRef.current.getValue() !== initialValue) {
			editorRef.current.setValue(initialValue);
		}
	}, [initialValue]);

	const handleEditorChange = useCallback(
		(value: string | undefined) => {
			const newValue = value ?? "";
			editorValueRef.current = newValue;
			if (onSaveOnCloseRef) onSaveOnCloseRef.current = false;
			onContentChange?.(newValue);
		},
		[onSaveOnCloseRef, onContentChange],
	);

	const handleEditorBlur = useCallback(() => {
		const value = editorValueRef.current;
		const isEmpty = !value.trim();
		onBlur?.(value, { isEmpty, isWithoutUpdate: false });
	}, [onBlur]);

	const handleUndo = useCallback(() => {
		editorRef.current?.trigger("keyboard", "undo", null);
	}, []);

	const handleRedo = useCallback(() => {
		editorRef.current?.trigger("keyboard", "redo", null);
	}, []);

	const handleUppercase = useCallback(() => {
		if (!editorRef.current) return;
		const selection = editorRef.current.getSelection();
		if (!selection) return;
		const model = editorRef.current.getModel();
		if (!model) return;
		const text = model.getValueInRange(selection);
		if (!text) return;
		editorRef.current.executeEdits("", [{ range: selection, text: text.toUpperCase() }]);
	}, []);

	const handleStyle = useCallback(
		(
			type: "bold" | "italic" | "underline" | "heading" | "list" | "orderedList",
			level?: number,
		) => {
			if (!editorRef.current) return;
			const selection = editorRef.current.getSelection();
			if (!selection) return;
			const model = editorRef.current.getModel();
			if (!model) return;
			const text = model.getValueInRange(selection);
			let newText = text;
			const isEmptySelection =
				selection.startLineNumber === selection.endLineNumber &&
				selection.startColumn === selection.endColumn;
			let range = selection;
			if (isEmptySelection) {
				const lineNumber = selection.startLineNumber;
				const lineContent = model.getLineContent(lineNumber);
				range = {
					startLineNumber: lineNumber,
					startColumn: 1,
					endLineNumber: lineNumber,
					endColumn: lineContent.length + 1,
				};
				newText = lineContent;
			}
			switch (type) {
				case "bold":
					newText = newText ? `**${newText}**` : "**выделите текст**";
					break;
				case "italic":
					newText = newText ? `*${newText}*` : "*выделите текст*";
					break;
				case "underline":
					newText = newText ? `<u>${newText}</u>` : "<u>выделите текст</u>";
					break;
				case "heading": {
					const lines = newText.split("\n");
					newText = lines
						.map(
							(line: string) =>
								`${"#".repeat(level || 1)} ${line.replace(/^#+\s*/, "")}`,
						)
						.join("\n");
					break;
				}
				case "list": {
					const lines = newText.split("\n");
					newText = lines
						.map((line: string) => `- ${line.replace(/^[-*] /, "")}`)
						.join("\n");
					break;
				}
				case "orderedList": {
					const lines = newText.split("\n");
					newText = lines
						.map(
							(line: string, idx: number) =>
								`${idx + 1}. ${line.replace(/^\d+\. /, "")}`,
						)
						.join("\n");
					break;
				}
			}
			editorRef.current.executeEdits("", [{ range, text: newText }]);
		},
		[],
	);

	const handleEditorDidMount = useCallback(
		(editorInstance: any) => {
			editorRef.current = editorInstance;

			// Firefox specific fixes
			if (isFirefox) {
				// Force layout recalculation for Firefox
				setTimeout(() => {
					editorInstance.layout();
				}, 100);
			}

			editorInstance.onDidBlurEditorWidget(() => {
				handleEditorBlur();
			});
		},
		[handleEditorBlur],
	);

	return {
		editorRef,
		editorValueRef,
		handleEditorChange,
		handleEditorBlur,
		handleUndo,
		handleRedo,
		handleUppercase,
		handleStyle,
		handleEditorDidMount,
	};
}
