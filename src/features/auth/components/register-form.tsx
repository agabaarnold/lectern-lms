import { revalidateLogic } from "@tanstack/react-form-start";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "react-hot-toast";

import { GithubIcon } from "#/components/icons/github-icon.tsx";
import { GoogleIcon } from "#/components/icons/google-icon.tsx";
import { Button } from "#/components/ui/button.tsx";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldSeparator,
} from "#/components/ui/field.tsx";
import { useAppForm } from "#/hooks/form/use-form.ts";
import { authClient } from "#/lib/auth-client.ts";

import { registerSchema } from "../schema";
import type { RegisterInput } from "../schema";

const defaultValues: RegisterInput = {
	email: "",
	name: "",
	password: "",
};

const handleGoogleSignup = async () => {
	await authClient.signIn.social({
		provider: "google",
		fetchOptions: {
			onError: ({ error }) => {
				toast.error(error.message);
			},
		},
	});
};

const handleGithubSignup = async () => {
	await authClient.signIn.social({
		provider: "github",
		fetchOptions: {
			onError: ({ error }) => {
				toast.error(error.message);
			},
		},
	});
};

const RegisterForm = () => {
	const navigate = useNavigate();

	const form = useAppForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			await authClient.signUp.email({
				...value,
				callbackURL: `${window.location.origin}/email-verified`,
				fetchOptions: {
					onError: ({ error }) => {
						toast.error(error.message);
					},
					onSuccess: () => {
						toast.success(
							"Account created. Check your email to verify your address."
						);
						navigate({ to: "/login", replace: true });
					},
				},
			});
		},
		validationLogic: revalidateLogic({
			mode: "submit",
			modeAfterSubmission: "blur",
		}),
		validators: { onSubmit: registerSchema },
	});

	return (
		<Card className="my-10 w-full max-w-sm md:max-w-md">
			<CardHeader className="text-center">
				<CardTitle>Create your account</CardTitle>
				<CardDescription>
					Welcome! Please fill in the details to get started
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
						<form.AppField name="name">
							{(field) => (
								<field.FormInput
									label="Full name"
									placeholder="Enter your full name"
									type="text"
								/>
							)}
						</form.AppField>

						<form.AppField name="email">
							{(field) => (
								<field.FormInput
									label="Email address"
									placeholder="Enter your email address"
									type="email"
								/>
							)}
						</form.AppField>

						<form.AppField name="password">
							{(field) => (
								<field.FormPassword
									label="Password"
									placeholder="Enter your password"
								/>
							)}
						</form.AppField>

						<form.AppForm>
							<form.SubmitButton
								label="Create account"
								submitLabel="Registering"
							/>
						</form.AppForm>

						<FieldSeparator>or continue with</FieldSeparator>

						<Field>
							<Button
								className="relative"
								onClick={handleGithubSignup}
								type="button"
								variant="outline"
							>
								<GithubIcon /> Sign up with Github
							</Button>

							<Button
								className="relative"
								onClick={handleGoogleSignup}
								type="button"
								variant="outline"
							>
								<GoogleIcon /> Sign up with Google
							</Button>
						</Field>

						<FieldDescription className="text-center">
							Already have an account? <Link to="/login">Login</Link>
						</FieldDescription>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
};

export default RegisterForm;
