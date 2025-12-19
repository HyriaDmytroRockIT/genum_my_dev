import { useAuth0 } from "@auth0/auth0-react";
import { useLocalAuth } from "@/contexts/LocalAuthContext";
import { getAuthMode } from "@/lib/auth";

/**
 * Unified authentication hook that works for both cloud (Auth0) and self-hosted modes
 * Returns a consistent interface regardless of the authentication mode
 */
export function useAuth() {
	const authMode = getAuthMode();

	if (authMode === "local") {
		const localAuth = useLocalAuth();
		return {
			isAuthenticated: localAuth.isAuthenticated,
			isLoading: localAuth.isLoading,
			user: localAuth.user,
			getAccessTokenSilently: localAuth.getAccessTokenSilently,
			loginWithRedirect: localAuth.loginWithRedirect,
			logout: localAuth.logout,
		};
	}

	// Cloud mode - use Auth0
	const auth0 = useAuth0();
	return {
		isAuthenticated: auth0.isAuthenticated,
		isLoading: auth0.isLoading,
		user: auth0.user,
		getAccessTokenSilently: auth0.getAccessTokenSilently,
		loginWithRedirect: auth0.loginWithRedirect,
		logout: auth0.logout,
	};
}
