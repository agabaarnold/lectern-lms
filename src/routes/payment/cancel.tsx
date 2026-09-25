// oxlint-disable react/function-component-definition func-style
import { IconArrowLeft, IconX } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { buttonVariants } from "#/components/ui/button.tsx";
import { Card, CardContent } from "#/components/ui/card.tsx";

export const Route = createFileRoute("/payment/cancel")({
	component: PaymentCancelled,
});

function PaymentCancelled() {
	return (
		<div className="flex min-h-screen w-full flex-1 items-center justify-center">
			<Card className="w-[350px]">
				<CardContent>
					<div className="flex w-full justify-center">
						{/* oxlint-disable-next-line shadcn/no-raw-colors */}
						<IconX className="size-12 rounded-full bg-red-500/30 p-2 text-red-500" />
					</div>

					<div className="mt-3 w-full text-center sm:mt-5">
						<h2 className="text-xl font-semibold">Payment cancelled</h2>
						<p className="text-muted-foreground mt-2 text-sm tracking-tight text-balance">
							No worries, you won&apos;t be charged. Please try again.
						</p>

						<Link
							to="/"
							className={buttonVariants({ className: "w-full mt-5" })}
						>
							<IconArrowLeft className="size-4" /> Go back to Homepage
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
