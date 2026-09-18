// oxlint-disable react/function-component-definition func-style
import { createFileRoute } from "@tanstack/react-router";

import VerifyEmailForm from "#/features/auth/components/verify-email-form.tsx";

export const Route = createFileRoute("/_auth/verify-email")({
	component: VerifyEmailPage,
});

function VerifyEmailPage() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<VerifyEmailForm />
		</div>
	);
}
