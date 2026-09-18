// oxlint-disable react/function-component-definition func-style
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

import { buttonVariants } from "#/components/ui/button.tsx";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";

export const Route = createFileRoute("/_app/email-verified")({
	component: EmailVerifiedPage,
	validateSearch: z.object({
		error: z.string().trim().optional(),
	}),
});

function EmailVerifiedPage() {
	const { error } = Route.useSearch();

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Card className="w-full max-w-sm md:max-w-md">
					<CardHeader className="text-center">
						<CardTitle>Verification link invalid</CardTitle>
						<CardDescription>
							This verification link is invalid or has expired. Request a new
							one below.
						</CardDescription>
					</CardHeader>
					<CardFooter className="flex items-center justify-center">
						<Link
							className={buttonVariants({ variant: "default" })}
							to="/verify-email"
						>
							Resend verification email
						</Link>
					</CardFooter>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<Card className="w-full max-w-sm md:max-w-md">
				<CardHeader className="text-center">
					<CardTitle>Email verified</CardTitle>
					<CardDescription>
						Your email address has been verified. You now have full access to
						Lectern.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex items-center justify-center">
					<Link className={buttonVariants({ variant: "default" })} to="/">
						Go to home page
					</Link>
				</CardContent>
			</Card>
		</div>
	);
}
