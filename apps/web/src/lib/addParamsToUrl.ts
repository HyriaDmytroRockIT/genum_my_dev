import { useParams } from "react-router-dom";

/**
 * Adds the current orgId and projectId to a URL path
 * @param url The URL path to add parameters to (e.g., '/dashboard', '/prompts')
 * @param params Optional object containing orgId and projectId to override the ones from useParams
 * @returns The URL with orgId and projectId added (e.g., '/123/456/dashboard')
 */
export const addParamsToUrl = (
	url: string,
	params?: { orgId?: string; projectId?: string },
): string => {
	// If the URL already starts with a slash and orgId, return it as is
	if (url.match(/^\/\d+\/\d+\//)) {
		return url;
	}

	// Remove leading slash if present
	const cleanUrl = url.startsWith("/") ? url.substring(1) : url;

	// Get orgId and projectId from params or from the current URL
	let orgId = params?.orgId;
	let projectId = params?.projectId;

	if (!orgId || !projectId) {
		// Extract from path: /:orgId/:projectId/...
		const pathSegments = window.location.pathname.split("/").filter(Boolean);
		orgId = orgId || (pathSegments.length >= 1 ? pathSegments[0] : "");
		projectId = projectId || (pathSegments.length >= 2 ? pathSegments[1] : "");
	}

	// If we still don't have orgId or projectId, return the original URL
	if (!orgId || !projectId) {
		return url;
	}

	// Construct the new URL with orgId and projectId
	return `/${orgId}/${projectId}/${cleanUrl}`;
};

/**
 * React hook that returns a function to add the current orgId and projectId to a URL path
 * @returns A function that takes a URL and optional params and returns the URL with orgId and projectId added
 */
export const useAddParamsToUrl = () => {
	const { orgId, projectId } = useParams<{ orgId: string; projectId: string }>();

	return (url: string, overrideParams?: { orgId?: string; projectId?: string }): string => {
		// If the URL already starts with a slash and orgId, return it as is
		if (url.match(/^\/\d+\/\d+\//)) {
			return url;
		}

		// Remove leading slash if present
		const cleanUrl = url.startsWith("/") ? url.substring(1) : url;

		// Use override params or params from useParams
		const finalOrgId = overrideParams?.orgId || orgId;
		const finalProjectId = overrideParams?.projectId || projectId;

		// If we don't have orgId or projectId, return the original URL
		if (!finalOrgId || !finalProjectId) {
			return url;
		}

		// Construct the new URL with orgId and projectId
		return `/${finalOrgId}/${finalProjectId}/${cleanUrl}`;
	};
};
