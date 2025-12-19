import { useState } from "react";

interface UsePaginationOptions {
	initialPage?: number;
	pageSize?: number;
}

export const usePagination = ({ initialPage = 1, pageSize = 10 }: UsePaginationOptions = {}) => {
	const [page, setPage] = useState(initialPage);

	const next = () => setPage((p) => p + 1);
	const prev = () => setPage((p) => Math.max(1, p - 1));
	const reset = () => setPage(initialPage);

	return { page, pageSize, next, prev, reset };
};
