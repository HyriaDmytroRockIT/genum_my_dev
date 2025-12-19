import { UserType } from "@/types/User";
import { Navigate, useParams } from "react-router-dom";
import { useUserStore } from "@/stores/user.store";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { userApi } from "@/api/user";
import { setApiContext, clearApiContext } from "@/api/client";

/**
 * This component is the "entry point" for the authenticated part of the app.
 *
 * Responsibilities:
 * - **Initialize API context** (token + orgId/projectId) for `apiClient` interceptors.
 * - **Load the current user** (`/user/me`) and store it in zustand.
 * - **Normalize the URL**: if orgId/projectId are missing or invalid, pick a default
 *   workspace (org/project) and redirect.
 *
 * Why it matters here:
 * - The router wraps all "app" pages with `ProtectedRoute -> RedirectedToProjectRoute -> MainLayout`.
 * - While `userData` is not loaded, we don't render the layout/pages to prevent them from firing
 *   API requests without context and without user data.
 */
interface RedirectedToProjectRouteProps {
	Element: React.ComponentType<{ user: UserType }>;
}

// Keys used to remember the last opened workspace (org/project).
// This allows restoring the user's last location on the next visit.
const GENUMLAB_LAST_ORG_ID = "genumlab_last_org_id";
const GENUMLAB_LAST_PROJECT_ID = "genumlab_last_project_id";

const RedirectedToProjectRoute = ({ Element }: RedirectedToProjectRouteProps) => {
	// orgId/projectId come from the URL (both optional: `/:orgId?/:projectId?`).
	const { orgId, projectId } = useParams<{ orgId: string; projectId: string }>();
	// `useAuth` provides a unified interface for Auth0 (cloud) and local auth (self-hosted).
	const { isAuthenticated, isLoading: isLoadingAuth, getAccessTokenSilently } = useAuth();
	// `userData` is the "full" user payload (orgs/projects), while `user` is a lightweight
	// summary (name/email/avatar) used by UI components.
	const { userData, loading, setUserData, setUser, setLoading } = useUserStore();

	// Initialize API context for axios interceptors:
	// - in cloud mode it adds `Authorization: Bearer ...`
	// - it adds `lab-org-id` / `lab-proj-id` headers (when available)
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

		return () => {
			// Important: context is stored globally in `api/client.ts`.
			// On unmount, clear it to avoid leaking org/project between sessions / router branches.
			clearApiContext();
		};
	}, [getAccessTokenSilently, orgId, projectId]);

	// Local loading/error state for fetching the user (without React Query).
	const [isLoadingUser, setIsLoadingUser] = useState(false);
	const [userError, setUserError] = useState<Error | null>(null);

	// Fetch user profile once after authentication.
	// NOTE: `userData` in the store is used as an "already loaded" guard.
	useEffect(() => {
		const fetchUserData = async () => {
			if (!isAuthenticated || isLoadingAuth || userData) {
				return;
			}

			setIsLoadingUser(true);
			setUserError(null);
			setLoading(true);

			try {
				// Thin API service (axios via `apiClient` + interceptors + ApiError).
				const data = await userApi.getCurrentUser();

				// Basic validation: email is required (used elsewhere in the app).
				if (!data.email) {
					console.error("[RedirectedToProjectRoute] Invalid user data structure:", data);
					return;
				}

				// Store both the full user payload and the UI-friendly summary.
				setUserData(data);
				setUser({
					name: data.name || "",
					email: data.email || "",
					avatar: data.avatar ?? undefined,
				});
				setLoading(false);
			} catch (err) {
				const error = err as Error;
				console.error("Error getting user data:", error);
				setUserError(error);
				setLoading(false);
			} finally {
				setIsLoadingUser(false);
			}
		};

		fetchUserData();
	}, [isAuthenticated, isLoadingAuth, userData, setUserData, setUser, setLoading]);

	// Keep store.loading in sync with auth + user fetch states.
	useEffect(() => {
		if (isAuthenticated && !isLoadingAuth && userData) {
			// userData is already loaded
			setLoading(false);
		} else if (!isLoadingAuth && !isAuthenticated) {
			setLoading(false);
		} else if (isLoadingUser) {
			setLoading(true);
		}
	}, [isAuthenticated, isLoadingAuth, userData, isLoadingUser, setLoading]);

	// Gate: while auth/user data isn't ready, show a simple placeholder.
	// This prevents rendering MainLayout and child pages before `userData` exists.
	if (!isAuthenticated || isLoadingAuth || loading || !userData) {
		return (
			<div className="flex h-screen w-full items-center justify-center">
				<div className="flex flex-col items-center space-y-4">
					<div className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
					<p className="text-gray-500 dark:text-gray-400">Loading...</p>
				</div>
			</div>
		);
	}

	// Pick a default workspace:
	// - first, an org where the user is OWNER and there are projects
	// - otherwise, any org that has projects
	const getDefaultSpace = () => {
		if (!userData.organizations || userData.organizations.length === 0) {
			return null;
		}

		let orgWithProjects = userData.organizations.find(
			(org) => org.role === "OWNER" && org.projects && org.projects.length > 0,
		);

		if (!orgWithProjects) {
			orgWithProjects = userData.organizations.find(
				(org) => org.projects && org.projects.length > 0,
			);
		}

		if (!orgWithProjects) {
			return null;
		}

		const project = orgWithProjects.projects[0];
		return { org: orgWithProjects, project };
	};

	// If the URL doesn't include orgId/projectId, try restoring the last workspace from localStorage.
	if (!orgId && !projectId) {
		const lastOrgId = localStorage.getItem(GENUMLAB_LAST_ORG_ID);
		const lastProjectId = localStorage.getItem(GENUMLAB_LAST_PROJECT_ID);

		if (lastOrgId && lastProjectId) {
			const matchingOrg = userData.organizations.find(
				(org) => org.id.toString() === lastOrgId,
			);
			if (matchingOrg) {
				const matchingProject = matchingOrg.projects.find(
					(project) => project.id.toString() === lastProjectId,
				);
				if (matchingProject) {
					return (
						<Navigate to={`/${lastOrgId}/${lastProjectId}/getting-started`} replace />
					);
				}
			}
		}
	}

	const defaultSpace = getDefaultSpace();
	if (!defaultSpace) {
		// The user is authenticated, but there are no available orgs/projects.
		return (
			<div className="flex h-screen w-full items-center justify-center">
				<div className="flex flex-col items-center space-y-4">
					<p className="text-red-500">No organizations or projects found</p>
				</div>
			</div>
		);
	}

	// If the URL contains orgId + projectId, verify they belong to the user's available orgs/projects.
	// Otherwise, redirect to the default workspace.
	if (orgId && projectId) {
		const matchingOrg = userData.organizations.find((org) => org.id.toString() === orgId);

		if (matchingOrg) {
			const matchingProject = matchingOrg.projects.find(
				(project) => project.id.toString() === projectId,
			);

			if (matchingProject) {
				return <Element user={userData} />;
			}
		}

		return (
			<Navigate
				to={`/${defaultSpace.org.id}/${defaultSpace.project.id}/getting-started`}
				replace
			/>
		);
	}

	// If orgId exists but projectId doesn't, pick the first project in that org (if any),
	// otherwise redirect to the default workspace.
	if (orgId && !projectId) {
		const matchingOrg = userData.organizations.find((org) => org.id.toString() === orgId);

		if (matchingOrg && matchingOrg.projects.length > 0) {
			const project = matchingOrg.projects[0];
			return <Navigate to={`/${matchingOrg.id}/${project.id}/getting-started`} replace />;
		}

		return (
			<Navigate
				to={`/${defaultSpace.org.id}/${defaultSpace.project.id}/getting-started`}
				replace
			/>
		);
	}

	// Fallback: redirect to the default workspace.
	return (
		<Navigate
			to={`/${defaultSpace.org.id}/${defaultSpace.project.id}/getting-started`}
			replace
		/>
	);
};

export default RedirectedToProjectRoute;
