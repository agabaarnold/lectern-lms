import { revalidateLogic } from "@tanstack/react-form-start";
import { Link } from "@tanstack/react-router";
import { toast } from "react-hot-toast";

import { Captcha } from "#/components/shared/captcha.tsx";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";
import { FieldDescription, FieldGroup } from "#/components/ui/field.tsx";
import { useAppForm } from "#/hooks/form/use-form.ts";
import { useCaptcha } from "#/hooks/use-captcha.ts";
import { authClient } from "#/lib/auth-client.ts";

import { forgotPasswordSchema } from "../schema";
import type { ForgotPasswordInput } from "../schema";

const defaultValues: ForgotPasswordInput = { email: "" };

const ForgotPasswordForm = () => {
	const {
		token: captchaToken,
		onVerify,
		onExpire,
		reset: resetCaptcha,
	} = useCaptcha();

	const form = useAppForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			if (!captchaToken) {
				toast.error("Please complete the captcha");
				return;
			}

			await authClient.requestPasswordReset({
				email: value.email,
				redirectTo: `${window.location.origin}/reset-password`,
				fetchOptions: {
					headers: { "x-captcha-response": captchaToken },
					onError: ({ error }) => {
						toast.error(error.message);
						resetCaptcha();
					},
					onSuccess: () => {
						toast.success(
							"If an account with this email exists, you'll receive a reset password email"
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
				<CardTitle>Request Password Reset</CardTitle>
				<CardDescription>
					Enter your email address below to receive password reset instructions
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

						<Captcha onVerify={onVerify} onExpire={onExpire} />

						<form.AppForm>
							<form.SubmitButton label="Submit" />
						</form.AppForm>

						<FieldDescription className="text-center">
							Remembered your password? <Link to="/login">Login</Link> here.
						</FieldDescription>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
};

export default ForgotPasswordForm;
