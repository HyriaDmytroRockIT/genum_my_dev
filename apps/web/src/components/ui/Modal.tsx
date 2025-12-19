import React, { forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
	title: string | ReactNode;
	closeItem?: ReactNode;
	children: ReactNode;
	className?: string;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
	({ title, closeItem, children, className }: ModalProps, ref) => {
		return (
			<div
				ref={ref}
				className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
			>
				<div
					className={cn(
						"bg-white rounded-lg shadow-xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col",
						className,
					)}
				>
					<div className="flex items-center justify-between mb-3">
						{typeof title === "string" ? (
							<h2 className="text-lg font-semibold">{title}</h2>
						) : (
							title
						)}
						{closeItem}
					</div>

					{children}
				</div>
			</div>
		);
	},
);

export default Modal;
