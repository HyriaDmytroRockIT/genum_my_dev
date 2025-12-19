import { useQuery, UseQueryResult, UseQueryOptions } from "@tanstack/react-query";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "./useAuth";
import { apiClient, setApiContext, ApiRequestConfig } from "@/api/client";

interface QueryParams<TData = any, TError = Error> {
	url?: string;
	queryFn?: () => Promise<TData>;
	keys: string[];
	method?: "GET" | "PUT" | "POST" | "DELETE" | "PATCH";
	body?: any;
	headers?: Record<string, string>;
	enabled?: boolean;
	onError?: (error: TError) => void;
	orgId?: string;
	projectId?: string;
	options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn" | "enabled">;
}

const useQueryWithAuth = <TData = any>(
	params: QueryParams<TData, Error>,
): UseQueryResult<TData, Error> => {
	const urlParams = useParams<{ orgId: string; projectId: string }>();
	const orgId = params?.orgId || urlParams.orgId;
	const projectId = params?.projectId || urlParams.projectId;
	const { getAccessTokenSilently } = useAuth();

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
			getOrgId: () => orgId,
			getProjectId: () => projectId,
		});
	}, [getAccessTokenSilently, orgId, projectId]);

	const queryResult = useQuery<TData, Error>({
		queryKey: params.keys,
		queryFn:
			params.queryFn ||
			(async (): Promise<TData> => {
				if (!params || !params.url) {
					return undefined as unknown as TData;
				}

				const { url, method = "GET", body, headers = {} } = params;

				const config: ApiRequestConfig = {
					headers: headers as Record<string, string>,
				};

				let response;
				switch (method) {
					case "POST":
						response = await apiClient.post<TData>(url, body, config);
						break;
					case "PUT":
						response = await apiClient.put<TData>(url, body, config);
						break;
					case "PATCH":
						response = await apiClient.patch<TData>(url, body, config);
						break;
					case "DELETE":
						response = await apiClient.delete<TData>(url, config);
						break;
					default:
						response = await apiClient.get<TData>(url, config);
				}

				return response.data;
			}),
		enabled: params.enabled !== false,
		...params.options,
	});

	useEffect(() => {
		if (queryResult.isError && queryResult.error && params.onError) {
			params.onError(queryResult.error);
		}
	}, [queryResult.isError, queryResult.error, params.onError]);

	return queryResult;
};

export default useQueryWithAuth;
