import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { UserType } from "@/types/User";

interface User {
	name: string;
	email: string;
	avatar?: string;
}

interface UserState {
	user: User | null;
	userData: UserType | null;
	loading: boolean;
	setUser: (user: User | null) => void;
	setUserData: (userData: UserType | null) => void;
	setLoading: (loading: boolean) => void;
	updateUser: (userData: Partial<User>) => void;
	clearUser: () => void;
}

export const useUserStore = create<UserState>()(
	devtools(
		(set) => ({
			user: null,
			userData: null,
			loading: true,
			setUser: (user) => set({ user }, false, "setUser"),
			setUserData: (userData) => set({ userData }, false, "setUserData"),
			setLoading: (loading) => set({ loading }, false, "setLoading"),
			updateUser: (userData) =>
				set(
					(state) => ({
						user: state.user ? { ...state.user, ...userData } : null,
					}),
					false,
					"updateUser",
				),
			clearUser: () =>
				set({ user: null, userData: null, loading: false }, false, "clearUser"),
		}),
		{ name: "user-store", enabled: true },
	),
);
