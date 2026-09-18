// oxlint-disable react/function-component-definition func-style
import { createFileRoute } from "@tanstack/react-router";

import ForgotPasswordForm from "#/features/auth/components/forgot-password-form.tsx";

export const Route = createFileRoute("/_auth/forgot-password")({
	component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<ForgotPasswordForm />
		</div>
	);
}
