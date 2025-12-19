import { useState, useEffect, useRef, useCallback } from "react";
import { useUserStore } from "@/stores/user.store";
import { UserType } from "@/types/User";
import { useAuth } from "./useAuth";
import { isCloudAuth } from "@/lib/auth";
import { userApi } from "@/api/user";

export function useUserData() {
	const { isAuthenticated, isLoading, getAccessTokenSilently, user } = useAuth();
	const setUser = useUserStore((state) => state.setUser);
	const isCloud = isCloudAuth();

	const [userData, setUserData] = useState<UserType | null>(null);
	const [loading, setLoading] = useState(true);
	const [token, setToken] = useState<string | null>(null);

	const hasFetchedRef = useRef(false);
	const currentUserRef = useRef(user?.sub);

	const fetchUserData = useCallback(
		async (forceRefresh = false) => {
			try {
				setLoading(true);
				const accessToken = isCloud ? await getAccessTokenSilently() : "";
				setToken(accessToken || "cookie-auth");

				const data = await userApi.getCurrentUser();

				setUserData(data);
				setUser({
					name: data.name || "",
					email: data.email || "",
					avatar: data.avatar,
				});

				return data;
			} catch (err) {
				console.error("Error getting user data:", err);
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[getAccessTokenSilently, setUser, isCloud],
	);

	useEffect(() => {
		if (currentUserRef.current !== user?.sub) {
			hasFetchedRef.current = false;
			currentUserRef.current = user?.sub;
			setUserData(null);
			setToken(null);
			setUser(null);
		}
	}, [user?.sub, setUser]);

	useEffect(() => {
		if (isAuthenticated && !isLoading && !hasFetchedRef.current) {
			fetchUserData();
			hasFetchedRef.current = true;
		} else if (!isLoading && !isAuthenticated) {
			setLoading(false);
			setUserData(null);
			setToken(null);
			setUser(null);
		}
	}, [isAuthenticated, isLoading, fetchUserData, setUser]);

	const refreshUserData = useCallback(() => {
		hasFetchedRef.current = false;
		return fetchUserData(true);
	}, [fetchUserData]);

	return {
		userData,
		token,
		loading,
		setUserData,
		fetchUserData: refreshUserData,
	};
}
