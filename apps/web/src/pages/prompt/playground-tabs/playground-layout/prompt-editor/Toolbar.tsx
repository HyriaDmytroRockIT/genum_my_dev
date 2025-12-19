import React from "react";
import {
	Bold,
	Italic,
	Underline,
	List,
	ListOrdered,
	Indent,
	Outdent,
	Undo2,
	Redo2,
	Link as LinkIcon,
	FileImage,
	ALargeSmall,
	AlignLeft,
	AlignCenter,
	AlignRight,
	AlignJustify,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface ToolbarProps {
	editor: any;
	onUndo: () => void;
	onRedo: () => void;
	onIndent: () => void;
	onOutdent: () => void;
	setTextAlign: (align: string) => void;
	onOpenLinkDialog: () => void;
	onInsertImage: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
	editor,
	onUndo,
	onRedo,
	onIndent,
	onOutdent,
	setTextAlign,
	onOpenLinkDialog,
	onInsertImage,
}) => {
	if (!editor) return null;

	const buttonProps = {
		variant: "ghost" as const,
		size: "icon" as const,
		className: "h-6 w-6",
	};

	const renderButton = (icon: React.ReactNode, tooltip: string, onClick: () => void) => (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button {...buttonProps} onClick={onClick}>
						{icon}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>{tooltip}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);

	return (
		<div className="flex flex-wrap items-center gap-1 px-2 py-1.5 bg-zinc-50 rounded-t-md">
			<div className="flex items-center gap-1">
				{renderButton(<Undo2 className="h-4 w-4" />, "Undo", onUndo)}
				{renderButton(<Redo2 className="h-4 w-4" />, "Redo", onRedo)}
				<Separator orientation="vertical" className="mx-1 h-6" />

				{renderButton(<ALargeSmall className="h-4 w-4" />, "Uppercase", () =>
					editor.commands.toggleUppercase(),
				)}
				<Separator orientation="vertical" className="mx-1 h-6" />

				{renderButton(<Bold className="h-4 w-4" />, "Bold", () =>
					editor.commands.toggleBold(),
				)}
				{renderButton(<Italic className="h-4 w-4" />, "Italic", () =>
					editor.commands.toggleItalic(),
				)}
				{renderButton(<Underline className="h-4 w-4" />, "Underline", () =>
					editor.commands.toggleUnderline(),
				)}
				<Separator orientation="vertical" className="mx-1 h-6" />

				{renderButton(<AlignLeft className="h-4 w-4" />, "Align Left", () =>
					setTextAlign("left"),
				)}
				{renderButton(<AlignCenter className="h-4 w-4" />, "Align Center", () =>
					setTextAlign("center"),
				)}
				{renderButton(<AlignRight className="h-4 w-4" />, "Align Right", () =>
					setTextAlign("right"),
				)}
				{renderButton(<AlignJustify className="h-4 w-4" />, "Align Justify", () =>
					setTextAlign("justify"),
				)}
				<Separator orientation="vertical" className="mx-1 h-6" />

				{renderButton(<List className="h-4 w-4" />, "Bullet List", () =>
					editor.commands.toggleList(),
				)}
				{renderButton(<ListOrdered className="h-4 w-4" />, "Numbered List", () =>
					editor.commands.toggleOrderedList(),
				)}
				{renderButton(<Indent className="h-4 w-4" />, "Indent", onIndent)}
				{renderButton(<Outdent className="h-4 w-4" />, "Outdent", onOutdent)}
				<Separator orientation="vertical" className="mx-1 h-6" />

				{renderButton(<LinkIcon className="h-4 w-4" />, "Insert Link", onOpenLinkDialog)}
				{renderButton(<FileImage className="h-4 w-4" />, "Insert Image", onInsertImage)}
			</div>
		</div>
	);
};

export default Toolbar;
