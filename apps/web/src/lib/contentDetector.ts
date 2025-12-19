export type ContentType = "html" | "json" | "xml" | "text";

const isJSON = (text: string): boolean => {
	const trimmed = text.trim();
	if (
		(trimmed.startsWith("{") && trimmed.endsWith("}")) ||
		(trimmed.startsWith("[") && trimmed.endsWith("]"))
	) {
		try {
			JSON.parse(trimmed);
			return true;
		} catch (e) {
			return false;
		}
	}
	return false;
};

const isHTML = (text: string): boolean => {
	if (/\sxml:[\w.-]+=/.test(text)) {
		return false;
	}
	if (/^\s*<\?xml/i.test(text)) {
		return false;
	}

	const doctypeRegex = /<!DOCTYPE html>/i;
	const structuralTagsRegex = /<html[^>]*>|<body[^>]*>|<head[^>]*>/i;
	const htmlSpecificTagsRegex =
		/<(form|input|button|script|style|img|video|audio|canvas|iframe|nav|header|footer|aside|article|section)[^>]*>/i;
	const commonTagsRegex =
		/<(p|div|span|a|table|tr|td|th|tbody|thead|b|i|strong|em|ul|ol|li|h[1-6])[^>]*>/i;
	const attributeRegex = /\s(onclick|onload|href|src|class|style)=/i;

	return (
		doctypeRegex.test(text) ||
		structuralTagsRegex.test(text) ||
		htmlSpecificTagsRegex.test(text) ||
		commonTagsRegex.test(text) ||
		attributeRegex.test(text)
	);
};

const isXML = (text: string): boolean => {
	const trimmed = text.trim();
	if (trimmed.startsWith("<?xml")) {
		return true;
	}
	if (/\sxml:[\w.-]+=/.test(trimmed)) {
		return true;
	}
	const comprehensiveHtmlTagsRegex =
		/^<((!DOCTYPE\s+html)|a|article|aside|audio|b|body|br|button|canvas|details|div|em|figcaption|figure|footer|form|h[1-6]|header|hr|html|i|iframe|img|input|label|li|link|main|menu|meta|nav|ol|option|p|script|section|select|small|span|strong|style|summary|table|textarea|ul|video)/i;

	if (comprehensiveHtmlTagsRegex.test(trimmed)) {
		return false;
	}
	if (!/^<([a-zA-Z_][\w.-]*)/s.test(trimmed)) {
		return false;
	}
	try {
		const parser = new DOMParser();
		const doc = parser.parseFromString(trimmed, "application/xml");
		if (doc.getElementsByTagName("parsererror").length > 0) {
			return false;
		}
		return true;
	} catch (e) {
		return false;
	}
};

export const detectContentType = (text: string): ContentType => {
	if (!text || text.trim() === "") {
		return "text";
	}
	if (isJSON(text)) {
		return "json";
	}
	// Check for XML first, as it's more specific than HTML fragments.
	// Custom tags are a strong indicator of XML.
	if (isXML(text)) {
		return "xml";
	}
	if (isHTML(text)) {
		return "html";
	}
	return "text";
};
