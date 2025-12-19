import React, { createContext, useContext, useState, ReactNode } from "react";

interface MemoryContextType {
	currentMemoryKey: string;
	setCurrentMemoryKey: (key: string) => void;
}

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

export const MemoryProvider = ({ children }: { children: ReactNode }) => {
	const [currentMemoryKey, setCurrentMemoryKey] = useState("");

	return (
		<MemoryContext.Provider value={{ currentMemoryKey, setCurrentMemoryKey }}>
			{children}
		</MemoryContext.Provider>
	);
};

export const useMemory = () => {
	const context = useContext(MemoryContext);
	if (context === undefined) {
		throw new Error("useMemory must be used within a MemoryProvider");
	}
	return context;
};
