import { useState } from "react";
import { helpersApi, PromptTuneResponse } from "@/api/helpers";

export function usePromptTune({
	editorValue,
	testcaseInput,
	currentInputContent,
	expectedContent,
	setIsExpanded,
	toast,
	setIsOpenPromptDiff,
}: {
	editorValue: string;
	testcaseInput?: string;
	currentInputContent?: string;
	expectedContent?: any;
	onContentChange?: (
		value: string,
		options?: { isEmpty?: boolean; isWithoutUpdate?: boolean },
	) => void;
	setIsExpanded: (v: boolean) => void;
	toast: (args: any) => void;
	setIsOpenPromptDiff: (open: boolean) => void;
}) {
	const [promptText, setPromptText] = useState("");
	const [tuneText, setTuneText] = useState("");
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<PromptTuneResponse | null>(null);

	const handleGenerate = async () => {
		try {
			setLoading(true);
			const result = await helpersApi.promptTune({
				instruction: editorValue,
				input: testcaseInput || "",
				output: currentInputContent || "",
				expectedOutput:
					typeof expectedContent === "object"
						? expectedContent?.answer || ""
						: expectedContent || "",
				context: promptText.trim(),
			});
			setData(result);
			setIsOpenPromptDiff(true);
			setIsExpanded(false);
			setPromptText("");
		} catch (err) {
			toast({ title: "Something went wrong", variant: "destructive" });
		} finally {
			setLoading(false);
		}
	};

	const handleTune = async () => {
		try {
			setLoading(true);
			const result = await helpersApi.promptTune({
				instruction: editorValue,
				input: testcaseInput || "",
				output: currentInputContent || "",
				expectedOutput:
					typeof expectedContent === "object"
						? expectedContent?.answer || ""
						: expectedContent || "",
				context: tuneText.trim(),
			});
			setData(result);
			setIsOpenPromptDiff(true);
			setIsExpanded(false);
			setTuneText("");
		} catch (err) {
			toast({ title: "Something went wrong", variant: "destructive" });
		} finally {
			setLoading(false);
		}
	};

	return {
		promptText,
		setPromptText,
		tuneText,
		setTuneText,
		handleGenerate,
		handleTune,
		loading,
		promptTuneMutation: {
			data,
			isPending: loading,
		},
	};
}
