import { apiClient, ApiRequestConfig } from "../client";

export interface LoginPayload {
	email: string;
	password: string;
}

export interface SignupPayload {
	email: string;
	password: string;
	name: string;
}

export const authApi = {
	/**
	 * Login with email and password (local auth)
	 */
	login: async (data: LoginPayload, config?: ApiRequestConfig): Promise<void> => {
		await apiClient.post("/auth/local/login", data, config);
	},

	/**
	 * Register with email, password and name (local auth)
	 */
	signup: async (data: SignupPayload, config?: ApiRequestConfig): Promise<void> => {
		await apiClient.post("/auth/local/register", data, config);
	},

	/**
	 * Logout (local auth)
	 */
	logout: async (config?: ApiRequestConfig): Promise<void> => {
		await apiClient.post("/auth/local/logout", undefined, config);
	},
};
