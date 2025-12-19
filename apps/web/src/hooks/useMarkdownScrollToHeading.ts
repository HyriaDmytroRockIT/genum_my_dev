import { useCallback } from "react";

export function useMarkdownScrollToHeading({ editorRef }: { editorRef: React.RefObject<any> }) {
	return useCallback(
		(anchor: string) => {
			const match = anchor.match(/^heading-(\d+)$/);
			if (!match) return;
			const line = parseInt(match[1], 10);
			if (!editorRef.current) return;
			editorRef.current.revealLineInCenter(line);
			editorRef.current.setPosition({ lineNumber: line, column: 1 });
			editorRef.current.focus();
		},
		[editorRef],
	);
}
