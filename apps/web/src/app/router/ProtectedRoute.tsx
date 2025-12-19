import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { isCloudAuth } from "@/lib/auth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, isLoading, loginWithRedirect } = useAuth();
	const navigate = useNavigate();
	const isCloud = isCloudAuth();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			if (isCloud) {
				// Cloud mode: use Auth0 redirect
				loginWithRedirect();
			} else {
				// Self-hosted mode: redirect to login page
				const currentPath = window.location.pathname + window.location.search;
				navigate(`/login?returnTo=${encodeURIComponent(currentPath)}`);
			}
		}
	}, [isAuthenticated, isLoading, loginWithRedirect, navigate, isCloud]);

	if (isLoading) return null;

	if (!isAuthenticated) {
		return null;
	}

	return <>{children}</>;
}
