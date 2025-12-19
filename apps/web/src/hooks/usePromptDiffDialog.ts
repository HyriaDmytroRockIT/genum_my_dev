import { useState } from "react";

export function usePromptDiffDialog(
	onContentChange?: (
		value: string,
		options?: { isEmpty?: boolean; isWithoutUpdate?: boolean },
	) => void,
	editorValueRef?: React.MutableRefObject<string>,
	editorRef?: React.MutableRefObject<any>,
	onBlur?: (value: string, options?: { isEmpty?: boolean; isWithoutUpdate?: boolean }) => void,
) {
	const [isOpenPromptDiff, setIsOpenPromptDiff] = useState(false);

	const onSaveTune = (value = "") => {
		onContentChange?.(value, { isEmpty: !value.trim(), isWithoutUpdate: false });
		if (editorValueRef) editorValueRef.current = value;
		if (editorRef && editorRef.current) editorRef.current.setValue(value);
		onBlur?.(value, { isEmpty: !value.trim(), isWithoutUpdate: false });
		setIsOpenPromptDiff(false);
	};

	return {
		isOpenPromptDiff,
		setIsOpenPromptDiff,
		onSaveTune,
	};
}
