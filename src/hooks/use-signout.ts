import { useNavigate } from "@tanstack/react-router";
import { toast } from "react-hot-toast";

import { authClient } from "#/lib/auth-client.ts";

export const useSignout = () => {
	const navigate = useNavigate();

	const handleSignout = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					navigate({ to: "/" });
					toast.success("Logged out successfully");
				},
				onError: ({ error }) => {
					toast.error(error.message ?? "Failed to log you out");
				},
			},
		});
	};

	return { handleSignout };
};
