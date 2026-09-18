// oxlint-disable react/function-component-definition func-style
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { getUserSession } from "#/features/auth/functions/index.ts";

export const Route = createFileRoute("/_app")({
	beforeLoad: async ({ location }) => {
		const { session } = await getUserSession();
		if (!session) {
			throw redirect({ to: "/login", search: { redirect: location.href } });
		}

		return { user: session.user };
	},
	component: AppLayout,
});

function AppLayout() {
	return (
		<div>
			<Outlet />
		</div>
	);
}
