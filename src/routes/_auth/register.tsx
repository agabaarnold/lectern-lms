// oxlint-disable react/function-component-definition func-style
import { createFileRoute } from "@tanstack/react-router";

import RegisterForm from "#/features/auth/components/register-form.tsx";

export const Route = createFileRoute("/_auth/register")({
	component: RegisterPage,
});

function RegisterPage() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<RegisterForm />
		</div>
	);
}
