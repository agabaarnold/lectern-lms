// oxlint-disable react/function-component-definition func-style
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import ResetPasswordForm from "#/features/auth/components/reset-password-form.tsx";

export const Route = createFileRoute("/_auth/reset-password")({
	component: ResetPasswordPage,
	validateSearch: z.object({
		token: z.string().trim().optional(),
	}),
});

function ResetPasswordPage() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<ResetPasswordForm />
		</div>
	);
}
