import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import React from "react";

export interface MarkdownTocItem {
	id: string;
	level: number;
	text: string;
	anchor: string;
	line: number;
}

export function getMarkdownTocItems(content: string): MarkdownTocItem[] {
	const lines = content.split("\n");
	const items: MarkdownTocItem[] = [];
	lines.forEach((line, idx) => {
		const match = line.match(/^(#{1,6})\s+(.*)$/);
		if (match) {
			const lineNumber = idx + 1;
			items.push({
				id: `heading-${lineNumber}`,
				level: match[1].length,
				text: match[2],
				anchor: `heading-${lineNumber}`,
				line: lineNumber,
			});
		}
	});
	return items;
}

const headingComponent = (level: number, tocItems: MarkdownTocItem[]) => (props: any) => {
	const line = props.node?.position?.start?.line;
	const toc = tocItems.find((item) => item.level === level && item.line === line);
	const id = toc ? toc.anchor : undefined;
	const { id: _id, ...rest } = props;
	return React.createElement(`h${level}`, { id, ...rest }, props.children);
};

export function getMarkdownHeadingComponents(tocItems: MarkdownTocItem[]) {
	return {
		h1: headingComponent(1, tocItems),
		h2: headingComponent(2, tocItems),
		h3: headingComponent(3, tocItems),
		h4: headingComponent(4, tocItems),
		h5: headingComponent(5, tocItems),
		h6: headingComponent(6, tocItems),
	};
}

export function useMarkdownTOC(content: string, debounceMs: number = 300) {
	const [debouncedContent, setDebouncedContent] = useState<string>(content);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	useEffect(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		timeoutRef.current = setTimeout(() => {
			setDebouncedContent(content);
		}, debounceMs);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [content, debounceMs]);

	return useMemo(() => getMarkdownTocItems(debouncedContent), [debouncedContent]);
}

export function useMarkdownHeadingComponentsWithScroll(
	tocItems: MarkdownTocItem[],
	scrollToAnchor?: (anchor: string) => void,
) {
	const components = useMemo(() => {
		const headingComponentWithScroll = (level: number) => (props: any) => {
			const line = props.node?.position?.start?.line;
			const toc = tocItems.find((item) => item.level === level && item.line === line);
			const id = toc ? toc.anchor : undefined;
			const { id: _id, ...rest } = props;
			return React.createElement(
				`h${level}`,
				{
					id,
					...rest,
					ref: (el: HTMLElement | null) => {
						if (el && id && window.location.hash === `#${id}`) {
							el.scrollIntoView({ behavior: "smooth", block: "center" });
						}
					},
				},
				props.children,
			);
		};
		return {
			h1: headingComponentWithScroll(1),
			h2: headingComponentWithScroll(2),
			h3: headingComponentWithScroll(3),
			h4: headingComponentWithScroll(4),
			h5: headingComponentWithScroll(5),
			h6: headingComponentWithScroll(6),
		};
	}, [tocItems, scrollToAnchor]);
	return components;
}

export function useScrollToAnchor(options?: ScrollIntoViewOptions) {
	return useCallback(
		(anchor: string) => {
			const el = document.getElementById(anchor);
			if (el) {
				el.scrollIntoView({ behavior: "smooth", block: options?.block ?? "center" });
			}
		},
		[options],
	);
}
