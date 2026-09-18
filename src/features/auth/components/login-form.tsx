import { revalidateLogic } from "@tanstack/react-form-start";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "react-hot-toast";

import { GithubIcon } from "#/components/icons/github-icon.tsx";
import { GoogleIcon } from "#/components/icons/google-icon.tsx";
import { Badge } from "#/components/ui/badge.tsx";
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

import { loginSchema } from "../schema";
import type { LoginInput } from "../schema";

const defaultValues: LoginInput = {
	email: "",
	password: "",
	rememberMe: false,
};

const handleGoogleLogin = async () => {
	await authClient.signIn.social({
		provider: "google",
		fetchOptions: {
			onError: ({ error }) => {
				toast.error(error.message);
			},
		},
	});
};

const handleGithubLogin = async () => {
	await authClient.signIn.social({
		provider: "github",
		fetchOptions: {
			onError: ({ error }) => {
				toast.error(error.message);
			},
		},
	});
};

const LoginForm = () => {
	const navigate = useNavigate();
	const search = useSearch({ from: "/_auth/login" });

	const form = useAppForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			await authClient.signIn.email({
				...value,
				fetchOptions: {
					onError: ({ error }) => {
						toast.error(error.message);
					},
					onSuccess: () => {
						toast.success("Welcome back!");
						navigate({ to: search.redirect ?? "/", replace: true });
					},
				},
			});
		},
		validationLogic: revalidateLogic({
			mode: "submit",
			modeAfterSubmission: "blur",
		}),
		validators: { onSubmit: loginSchema },
	});

	const lastMethod = authClient.getLastUsedLoginMethod();

	return (
		<Card className="w-full max-w-sm md:max-w-md">
			<CardHeader className="text-center">
				<CardTitle>Sign in to Lectern</CardTitle>
				<CardDescription>
					Welcome back! Please sign in to continue
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
						<Field>
							<Button
								className="relative"
								onClick={handleGithubLogin}
								type="button"
								variant="outline"
							>
								<GithubIcon /> Sign in with Github{" "}
								{lastMethod === "github" && (
									<Badge className="absolute -top-2 -right-2">Last used</Badge>
								)}
							</Button>

							<Button
								className="relative"
								onClick={handleGoogleLogin}
								type="button"
								variant="outline"
							>
								<GoogleIcon /> Sign in with Google{" "}
								{lastMethod === "google" && (
									<Badge className="absolute -top-2 -right-2">Last used</Badge>
								)}
							</Button>
						</Field>

						<FieldSeparator>or continue with</FieldSeparator>

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
									isLogin={true}
									label="Password"
									placeholder="Enter your password"
								/>
							)}
						</form.AppField>

						<form.AppField name="rememberMe">
							{(field) => <field.FormCheckbox label="Remember me" />}
						</form.AppField>

						<form.AppForm>
							<form.SubmitButton label="Login" submitLabel="Logging in" />
						</form.AppForm>

						<FieldDescription className="text-center">
							Don&apos;t have an account? <Link to="/register">Register</Link>
						</FieldDescription>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
};

export default LoginForm;
