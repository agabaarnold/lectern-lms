// oxlint-disable react/function-component-definition func-style
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useEffectEvent } from "react";

import { buttonVariants } from "#/components/ui/button.tsx";
import { Card, CardContent } from "#/components/ui/card.tsx";
import { useConfetti } from "#/hooks/use-confetti.ts";

export const Route = createFileRoute("/_public/payment/success")({
	component: PaymentSuccess,
});

function PaymentSuccess() {
	const { triggerConfetti } = useConfetti();

	const confetti = useEffectEvent(() => triggerConfetti());

	useEffect(() => {
		confetti();
	}, []);

	return (
		<div className="flex min-h-screen w-full flex-1 items-center justify-center">
			<Card className="w-[350px]">
				<CardContent>
					<div className="flex w-full justify-center">
						{/* oxlint-disable-next-line shadcn/no-raw-colors */}
						<IconCheck className="size-12 rounded-full bg-green-500/30 p-2 text-green-500" />
					</div>

					<div className="mt-3 w-full text-center sm:mt-5">
						<h2 className="text-xl font-semibold">Payment successfull</h2>
						<p className="text-muted-foreground mt-2 text-sm tracking-tight text-balance">
							Congrats your payment was successful. You should now have access
							to the course.
						</p>

						<Link
							to="/dashboard"
							className={buttonVariants({ className: "w-full mt-5" })}
						>
							<IconArrowLeft className="size-4" /> Go to Dashboard
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
