import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { CircleAlert, CircleCheck, CirclePlus } from "lucide-react";

import { TestStatus } from "@/types/TestСase";

interface Testcase {
	id: number;
	name: string;
	status: "OK" | "NOK";
	assertionThoughts: string;
	promptRunStatus: string;
	prompt: {
		assertionType: "STRICT" | "MANUAL" | "AI";
	};
}

interface TestcaseAssertionModalProps {
	open: boolean;
	onClose: () => void;
	testcase: Testcase;
	status: string;
	assertionType?: string;
}

export const getTestCaseIcon = (type: TestStatus) => {
	switch (type) {
		case "OK":
			return <CircleCheck className="text-[#2E9D2A]" />;
		case "NOK":
			return <CirclePlus className="text-[#FF4545] transform rotate-45" />;
		case "NEED_RUN":
			return <CircleAlert className="text-[#FAAD15]" />;
		default:
			return null;
	}
};

export const getTestCaseStatusIcon = (type: string) => {
	if (type?.toLowerCase().includes("ok")) {
		return <CircleCheck className="text-[#2E9D2A] min-w-[16px]" />;
	} else if (type?.toLowerCase().includes("nok") || type?.toLowerCase().includes("fail")) {
		return <CirclePlus className="text-[#FF4545] min-w-[16px] transform rotate-45" />;
	} else if (
		type?.toLowerCase().includes("need_run") ||
		type?.toLowerCase().includes("pending")
	) {
		return <CircleAlert className="text-[#FAAD15] min-w-[16px]" />;
	} else {
		return <CircleAlert className="text-gray-400 min-w-[16px]" />;
	}
};

export const getTestCaseTooltip = (type: TestStatus) => {
	switch (type) {
		case "OK":
			return "Pass";
		case "NOK":
			return "Failed";
		case "NEED_RUN":
			return "Need run";
		default:
			return null;
	}
};

export const TestcaseAssertionModal = ({
	open,
	onClose,
	testcase,
	status,
	assertionType,
}: TestcaseAssertionModalProps) => {
	const isPassed = testcase.status === "OK";
	const runSuccess = testcase?.promptRunStatus?.toLowerCase().includes("success") ?? false;

	const currentAssertionType = assertionType || testcase.prompt.assertionType;
	const showAssertionFields = currentAssertionType === "AI";

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Testcase Assertion</DialogTitle>
				</DialogHeader>

				<div>
					<div className="flex justify-start gap-2 items-center text-[14px] h-[30px]">
						<span className="font-semibold">Status</span>
						<span className="[&_svg]:size-4 flex flex-row gap-1 items-center text-[#18181B] dark:text-muted-foreground">
							{getTestCaseIcon(testcase.status)}
							{getTestCaseTooltip(testcase.status)}
						</span>
					</div>

					<Separator className="my-2" />

					{status && (
						<>
							<div className="flex justify-start gap-2 items-center text-[14px] min-h-[30px]">
								<span className="font-semibold">Prompt Run Status</span>
								<span className="[&_svg]:size-4 flex flex-row gap-1 items-center text-[#18181B]">
									{getTestCaseStatusIcon(status)}
									{status}
								</span>
							</div>

							<Separator className="my-2" />
						</>
					)}

					<div className="flex items-center gap-2 h-[30px] text-[14px]">
						<span className="font-semibold">Assertion Type</span>
						<Badge
							className={
								{
									STRICT: "bg-[#2A9D90] text-white rounded-xl",
									MANUAL: "bg-[#6C98F2] text-white rounded-xl",
									AI: "bg-[#B66AD6] text-white rounded-xl",
								}[currentAssertionType] || "bg-gray-200 text-black"
							}
						>
							{currentAssertionType}
						</Badge>
					</div>

					{/* show these fields only for AI assertion type */}
					{showAssertionFields && (
						<>
							<div className="mt-4 flex flex-col gap-2 text-[14px]">
								<label className="font-semibold">Reasoning</label>
								<Textarea
									value={testcase.assertionThoughts}
									readOnly
									className="h-[100px]"
								/>
							</div>
						</>
					)}
				</div>

				<DialogFooter>
					<Button onClick={onClose}>OK</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
