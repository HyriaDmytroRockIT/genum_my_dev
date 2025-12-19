import { useState, useCallback, useRef, useEffect } from "react";

export function useEditorViewState() {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isMarkdownPreview, setIsMarkdownPreview] = useState(false);
	const hasSavedOnClose = useRef(false);

	const handleExpandToggle = useCallback((expanded: boolean) => {
		setIsExpanded(expanded);
	}, []);

	const handleMarkdownPreviewToggle = useCallback(() => {
		window.location.hash = "";
		setIsMarkdownPreview((prev) => !prev);
	}, []);

	const handleDialogOpenChange = useCallback((open: boolean, onSave?: () => void) => {
		if (!open && !hasSavedOnClose.current) {
			onSave?.();
			hasSavedOnClose.current = true;
		}
		if (open) {
			hasSavedOnClose.current = false;
		}
		setIsExpanded(open);
	}, []);

	return {
		isExpanded,
		setIsExpanded,
		handleExpandToggle,
		isMarkdownPreview,
		setIsMarkdownPreview,
		handleMarkdownPreviewToggle,
		hasSavedOnClose,
		handleDialogOpenChange,
	};
}

export function useAutoFocusEditorOnExpand(isExpanded: boolean, editorRef: React.RefObject<any>) {
	useEffect(() => {
		if (isExpanded && editorRef.current && typeof editorRef.current.focus === "function") {
			setTimeout(() => {
				editorRef.current.focus();
			}, 0);
		}
	}, [isExpanded, editorRef]);
}

export function useTooltipsEnabledOnExpand(isExpanded: boolean, delay: number = 300) {
	const [tooltipsEnabled, setTooltipsEnabled] = useState(true);
	useEffect(() => {
		if (isExpanded) {
			setTooltipsEnabled(false);
			const timer = setTimeout(() => setTooltipsEnabled(true), delay);
			return () => clearTimeout(timer);
		} else {
			setTooltipsEnabled(true);
		}
	}, [isExpanded, delay]);
	return tooltipsEnabled;
}
