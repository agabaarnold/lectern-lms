import { createFileRoute } from "@tanstack/react-router";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { Stripe } from "stripe";

import { db } from "#/db/index.ts";
import { enrollments } from "#/db/schema/lms.schema.ts";
import { env } from "#/env.server.ts";

export const Route = createFileRoute("/api/webhook/stripe")({
	server: {
		handlers: ({ createHandlers }) =>
			createHandlers({
				POST: {
					handler: async ({ request }) => {
						const body = await request.text();
						const headersList = getRequestHeaders();

						const signature = headersList.get("Stripe-Signature") as string;

						let event: Stripe.Event;

						try {
							event = Stripe.webhooks.constructEvent(
								body,
								signature,
								env.STRIPE_WEBHOOK_SECRET
							);
						} catch {
							return new Response("Webhook error", { status: 400 });
						}

						const session = event.data.object as Stripe.Checkout.Session;

						if (event.type === "checkout.session.completed") {
							const courseId = session.metadata?.courseId;
							const customerId = session.customer as string;

							if (!courseId) {
								throw new Error("Course id not found...");
							}

							const user = await db.query.users.findFirst({
								where: { stripeCustomerId: customerId },
							});

							if (!user) {
								throw new Error("User not found...");
							}

							await db
								.update(enrollments)
								.set({
									userId: user.id,
									courseId,
									amount: session.amount_total as number,
									status: "Active",
								})
								.where(eq(enrollments.id, session.metadata?.enrollmentId));
						}

						return new Response(null, { status: 200 });
					},
				},
			}),
	},
});
