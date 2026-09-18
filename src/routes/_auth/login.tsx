// oxlint-disable react/function-component-definition func-style
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import LoginForm from "#/features/auth/components/login-form.tsx";

export const Route = createFileRoute("/_auth/login")({
	component: LoginPage,
	validateSearch: z.object({
		redirect: z.string().optional(),
	}),
});

function LoginPage() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<LoginForm />
		</div>
	);
}
