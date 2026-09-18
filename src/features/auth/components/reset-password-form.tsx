import { revalidateLogic } from "@tanstack/react-form-start";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "react-hot-toast";

import { buttonVariants } from "#/components/ui/button.tsx";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";
import { FieldGroup } from "#/components/ui/field.tsx";
import { useAppForm } from "#/hooks/form/use-form.ts";
import { authClient } from "#/lib/auth-client.ts";

import { resetPasswordSchema } from "../schema";
import type { ResetPasswordInput } from "../schema";

const defaultValues: ResetPasswordInput = {
	newPassword: "",
	confirmPassword: "",
};

const ResetPasswordForm = () => {
	const navigate = useNavigate();
	const search = useSearch({ from: "/_auth/reset-password" });

	const form = useAppForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			await authClient.resetPassword({
				newPassword: value.newPassword,
				token: search.token,
				fetchOptions: {
					onError: ({ error }) => {
						toast.error(error.message);
					},
					onSuccess: () => {
						toast.success("Password reset successfully");
						navigate({ to: "/login", replace: true });
					},
				},
			});
		},
		validationLogic: revalidateLogic({
			mode: "submit",
			modeAfterSubmission: "blur",
		}),
		validators: { onSubmit: resetPasswordSchema },
	});

	if (!search.token) {
		return (
			<Card className="w-full max-w-sm md:max-w-md">
				<CardHeader className="text-center">
					<CardTitle>Invalid reset link</CardTitle>

					<CardDescription>
						The password reset link is invalid or has expired. Please request a
						new one.
					</CardDescription>
				</CardHeader>

				<CardFooter className="flex items-center justify-center">
					<Link
						className={buttonVariants({ variant: "default" })}
						to="/forgot-password"
					>
						Request a new one here
					</Link>
				</CardFooter>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-sm md:max-w-md">
			<CardHeader className="text-center">
				<CardTitle>Reset your password</CardTitle>
				<CardDescription>
					Enter and confirm your new password below
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<FieldGroup>
						<form.AppField name="newPassword">
							{(field) => (
								<field.FormPassword
									label="New password"
									placeholder="Enter your new password"
								/>
							)}
						</form.AppField>

						<form.AppField name="confirmPassword">
							{(field) => (
								<field.FormPassword
									label="Confirm password"
									placeholder="Confirm your password"
								/>
							)}
						</form.AppField>

						<form.AppForm>
							<form.SubmitButton label="Reset password" />
						</form.AppForm>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
};

export default ResetPasswordForm;
