import { createFileRoute } from "@tanstack/react-router";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { Stripe } from "stripe";
import { z } from "zod";

import { db } from "#/db/index.ts";
import { enrollments } from "#/db/schema/lms.schema.ts";
import { env } from "#/env.server.ts";
import { ajWebhook, toArcjetRequest } from "#/lib/arcjet";

export const Route = createFileRoute("/api/webhook/stripe")({
	server: {
		handlers: ({ createHandlers }) =>
			createHandlers({
				POST: {
					handler: async ({ request }) => {
						const decision = await ajWebhook.protect(toArcjetRequest(request));

						if (!decision.isErrored() && decision.isDenied()) {
							if (decision.reason.isRateLimit()) {
								return Response.json(
									{ error: "Too many requests" },
									{ status: 429 }
								);
							}

							return Response.json({ error: "Forbidden" }, { status: 403 });
						}

						const body = await request.text();
						const headersList = getRequestHeaders();

						const signature = headersList.get("Stripe-Signature");

						if (!signature) {
							return new Response("Missing webhook signature", {
								status: 400,
							});
						}

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

						if (
							event.type !== "checkout.session.completed" &&
							event.type !== "checkout.session.async_payment_succeeded"
						) {
							return new Response(null, { status: 200 });
						}

						const session = event.data.object;

						// Async payment methods settle after checkout completes;
						// only fulfill once funds have arrived.
						if (session.payment_status !== "paid") {
							return new Response(null, { status: 200 });
						}

						const enrollmentId = session.metadata?.enrollmentId;
						const customerId = z.string().safeParse(session.customer).data;
						const amount = session.amount_total;

						if (!enrollmentId || !customerId || amount === null) {
							return new Response("Webhook error: missing payment data", {
								status: 400,
							});
						}

						const user = await db.query.users.findFirst({
							where: { stripeCustomerId: customerId },
						});

						if (!user) {
							return new Response("Webhook error: unknown customer", {
								status: 400,
							});
						}

						await db
							.update(enrollments)
							.set({ amount, status: "Active" })
							.where(eq(enrollments.id, enrollmentId));

						return new Response(null, { status: 200 });
					},
				},
			}),
	},
});
