import { useCallback, useEffect, useRef, useState } from "react";
import { projectApi, UsageData } from "@/api/project";

export const useProjectUsage = (fromDate: string, toDate: string) => {
	const [data, setData] = useState<UsageData | undefined>(undefined);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const requestIdRef = useRef(0);

	const fetchUsage = useCallback(async () => {
		if (!fromDate || !toDate) {
			return;
		}

		const requestId = ++requestIdRef.current;
		setIsLoading(true);
		setError(null);

		try {
			const usage = await projectApi.getUsage(fromDate, toDate);
			if (requestId === requestIdRef.current) {
				setData(usage);
			}
		} catch (err) {
			if (requestId === requestIdRef.current) {
				setError(err as Error);
			}
		} finally {
			if (requestId === requestIdRef.current) {
				setIsLoading(false);
			}
		}
	}, [fromDate, toDate]);

	useEffect(() => {
		void fetchUsage();
	}, [fetchUsage]);

	return {
		data,
		isLoading,
		error,
		isError: Boolean(error),
		refetch: fetchUsage,
	};
};
