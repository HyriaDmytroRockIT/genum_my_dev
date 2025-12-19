import { useState, useEffect, useCallback } from "react";
import { userApi, Notification } from "@/api/user";

export const useNotificationById = (notificationId?: string) => {
	const [notification, setNotification] = useState<Notification | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchNotification = useCallback(async () => {
		if (!notificationId) {
			setNotification(null);
			return;
		}

		setLoading(true);
		setError(null);
		try {
			const data = await userApi.getNotification(notificationId);
			setNotification(data);
		} catch (err: any) {
			console.error("Error fetching notification:", err);
			setError(err?.message || "Failed to fetch notification");
		} finally {
			setLoading(false);
		}
	}, [notificationId]);

	useEffect(() => {
		fetchNotification();
	}, [fetchNotification]);

	return {
		notification,
		loading,
		error,
		refetch: fetchNotification,
	};
};
