import { IconArrowLeft, IconShieldX } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { buttonVariants } from "#/components/ui/button.tsx";
// oxlint-disable react/function-component-definition func-style
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";

export const Route = createFileRoute("/not-admin")({
	component: NotAdminRoute,
});

function NotAdminRoute() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="bg-destructive/10 mx-auto w-fit rounded-full p-4">
						<IconShieldX className="text-destructive size-16" />
					</div>

					{/* oxlint-disable-next-line shadcn/no-restyle */}
					<CardTitle className="text-2xl">Access Restricted</CardTitle>
					<CardDescription className="mx-auto max-w-xs">
						Hey! You are not an admin, which means you cannot create any courses
						or stuff like that...
					</CardDescription>
				</CardHeader>

				<CardContent>
					<Link className={buttonVariants({ className: "w-full" })} to="/">
						<IconArrowLeft className="mr-1 size-4" /> Back to home
					</Link>
				</CardContent>
			</Card>
		</div>
	);
}
