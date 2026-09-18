// oxlint-disable react/function-component-definition func-style
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { getUserSession } from "#/features/auth/functions/index.ts";

export const Route = createFileRoute("/_auth")({
	component: AuthLayout,
	beforeLoad: async () => {
		const { session } = await getUserSession();
		if (session) {
			throw redirect({ to: "/", replace: true });
		}
	},
});

function AuthLayout() {
	return <Outlet />;
}
