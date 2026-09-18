// oxlint-disable react/function-component-definition func-style
import { createFileRoute } from "@tanstack/react-router";

import VerifyEmailForm from "#/features/auth/components/verify-email-form.tsx";

export const Route = createFileRoute("/verify-email")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<VerifyEmailForm />
		</div>
	);
}
