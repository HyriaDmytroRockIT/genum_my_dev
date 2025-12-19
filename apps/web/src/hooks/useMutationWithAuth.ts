import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useAuth } from "./useAuth";
import { useEffect } from "react";
import { apiClient, setApiContext, ApiRequestConfig } from "@/api/client";

type MutationParams<TVariables = unknown> = {
	url: string;
	method?: "POST" | "PUT" | "PATCH" | "DELETE";
	data?: TVariables;
	finallyCallback?: () => void;
	orgId?: string;
	projectId?: string;
	headers?: HeadersInit;
	withContentType?: boolean;
};

export const useMutationWithAuth = <TResponse = unknown, TVariables = unknown>(): {
	mutation: UseMutationResult<TResponse, Error, MutationParams<TVariables>>;
} => {
	const { getAccessTokenSilently } = useAuth();
	const urlParams = useParams<{ orgId: string; projectId: string }>();

	// Set API context for axios interceptors
	useEffect(() => {
		setApiContext({
			getToken: async () => {
				try {
					return await getAccessTokenSilently();
				} catch {
					return "";
				}
			},
			getOrgId: () => urlParams.orgId,
			getProjectId: () => urlParams.projectId,
		});
	}, [getAccessTokenSilently, urlParams.orgId, urlParams.projectId]);

	const mutation = useMutation<TResponse, Error, MutationParams<TVariables>>({
		mutationFn: async (params) => {
			const {
				url,
				method = "POST",
				data,
				finallyCallback,
				headers,
				withContentType = true,
			} = params;

			const config: ApiRequestConfig = {
				headers: headers as Record<string, string> | undefined,
				withContentType,
			};

			try {
				let response;
				switch (method) {
					case "PUT":
						response = await apiClient.put<TResponse>(url, data, config);
						break;
					case "PATCH":
						response = await apiClient.patch<TResponse>(url, data, config);
						break;
					case "DELETE":
						response = await apiClient.delete<TResponse>(url, config);
						break;
					default:
						response = await apiClient.post<TResponse>(url, data, config);
				}
				return response.data;
			} finally {
				if (finallyCallback) finallyCallback();
			}
		},
	});

	return { mutation };
};

export default useMutationWithAuth;
