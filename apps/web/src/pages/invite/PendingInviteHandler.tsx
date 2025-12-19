import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const PendingInviteHandler = () => {
	const { user, isAuthenticated } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (isAuthenticated && user) {
			const pendingInviteToken = localStorage.getItem("pending_invite_token");
			if (pendingInviteToken) {
				// clear the token from localStorage
				localStorage.removeItem("pending_invite_token");
				// redirect to the invite page
				navigate(`/invite/${pendingInviteToken}`);
			}
		}
	}, [isAuthenticated, user, navigate]);

	return null; // this component does not render anything
};

export default PendingInviteHandler;
