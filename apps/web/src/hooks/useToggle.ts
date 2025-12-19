import { useCallback, useState } from "react";

export const useToggle = (initialState = false) => {
	const [isOn, setIsOn] = useState(initialState);

	const onToggle = useCallback(() => {
		setIsOn(true);
	}, []);

	const offToggle = useCallback(() => {
		setIsOn(false);
	}, []);

	return { isOn, onToggle, offToggle };
};
