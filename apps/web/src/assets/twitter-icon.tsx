import React from "react";

interface TwitterIconProps extends React.SVGProps<SVGSVGElement> {}

export const TwitterIcon = (props: TwitterIconProps) => (
	<svg
		{...props}
		width="14"
		height="13"
		viewBox="0 0 14 13"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M11.1236 0.351562H13.1593L8.7119 5.43464L13.9439 12.3516H9.84729L6.63867 8.15649L2.96729 12.3516H0.930367L5.68729 6.91464L0.668213 0.351562H4.86883L7.76914 4.18602L11.1236 0.351562ZM10.4091 11.1331H11.5371L4.2559 1.50602H3.04544L10.4091 11.1331Z"
			fill="currentColor"
		/>
	</svg>
);
