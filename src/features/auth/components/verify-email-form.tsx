import { revalidateLogic } from "@tanstack/react-form-start";
import { Link } from "@tanstack/react-router";
import { toast } from "react-hot-toast";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";
import { FieldDescription, FieldGroup } from "#/components/ui/field.tsx";
import { useAppForm } from "#/hooks/form/use-form.ts";
import { authClient } from "#/lib/auth-client.ts";

import { forgotPasswordSchema } from "../schema";
import type { ForgotPasswordInput } from "../schema";

const defaultValues: ForgotPasswordInput = { email: "" };

const VerifyEmailForm = () => {
	const form = useAppForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			await authClient.sendVerificationEmail({
				email: value.email,
				callbackURL: `${window.location.origin}/email-verified`,
				fetchOptions: {
					onError: ({ error }) => {
						toast.error(error.message);
					},
					onSuccess: () => {
						toast.success(
							"If an account with this email exists, you'll receive a verification email"
						);
					},
				},
			});
		},
		validationLogic: revalidateLogic({
			mode: "submit",
			modeAfterSubmission: "blur",
		}),
		validators: { onSubmit: forgotPasswordSchema },
	});

	return (
		<Card className="w-full max-w-sm md:max-w-md">
			<CardHeader className="text-center">
				<CardTitle>Verify your email</CardTitle>
				<CardDescription>
					Enter your email address to receive a new verification link
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
						<form.AppField name="email">
							{(field) => (
								<field.FormInput
									label="Email address"
									placeholder="Enter your email address"
									type="email"
								/>
							)}
						</form.AppField>

						<form.AppForm>
							<form.SubmitButton label="Resend verification email" />
						</form.AppForm>

						<FieldDescription className="text-center">
							Already verified? <Link to="/login">Login</Link> here.
						</FieldDescription>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
};

export default VerifyEmailForm;
