import { createContext, useContext, useState, useMemo, ReactNode } from "react";

interface PromptStatusContextType {
	isCommitted: boolean;
	setIsCommitted: (isCommitted: boolean) => void;
	activePromptId: number | undefined;
	setActivePromptId: (id: number | undefined) => void;
}

const PromptStatusContext = createContext<PromptStatusContextType | undefined>(undefined);

export const PromptStatusProvider = ({ children }: { children: ReactNode }) => {
	const [isCommitted, setIsCommitted] = useState<boolean>(false);
	const [activePromptId, setActivePromptId] = useState<number | undefined>(undefined);

	const value = useMemo(
		() => ({
			isCommitted,
			setIsCommitted,
			activePromptId,
			setActivePromptId,
		}),
		[isCommitted, activePromptId],
	);

	return <PromptStatusContext.Provider value={value}>{children}</PromptStatusContext.Provider>;
};

export const usePromptStatus = () => {
	const context = useContext(PromptStatusContext);
	if (context === undefined) {
		throw new Error("usePromptStatus must be used within a PromptStatusProvider");
	}
	return context;
};
