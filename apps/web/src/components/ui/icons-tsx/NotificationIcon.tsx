import React from "react";
import { Bell } from "lucide-react";

interface NotificationIconProps {
	size?: "sm" | "md" | "lg";
	className?: string;
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({
	size = "md",
	className = "",
}) => {
	const sizeClasses = {
		sm: "h-4 w-4",
		md: "h-6 w-6",
		lg: "h-6 w-6",
	};

	const containerSizeClasses = {
		sm: "h-6 w-6",
		md: "h-8 w-8",
		lg: "h-12 w-12",
	};

	return (
		<div
			className={`
        ${containerSizeClasses[size]}
        bg-sky-100
        dark:bg-sky-900/30
        rounded-lg
        flex
        items-center
        justify-center
        ${className}
      `}
		>
			<Bell
				className={`
          ${sizeClasses[size]}
          text-sky-600
          dark:text-sky-400
        `}
			/>
		</div>
	);
};

export default NotificationIcon;
