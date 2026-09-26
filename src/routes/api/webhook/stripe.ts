import { createFileRoute } from "@tanstack/react-router";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";
import { Stripe } from "stripe";
import { z } from "zod";

import { db } from "#/db/index.ts";
import { enrollments } from "#/db/schema/lms.schema.ts";
import { env } from "#/env.server.ts";
import { ajWebhook, toArcjetRequest } from "#/lib/arcjet";
import { stripeClient } from "#/lib/stripe.ts";

const badRequest = (reason: string): Response =>
	new Response(`Webhook error: ${reason}`, { status: 400 });

// Binds a Stripe event to our own records: the enrollment must exist,
// belong to the Stripe-matched customer, and reference a real course.
const verifyEnrollmentOwnership = async (
	enrollmentId: string,
	customerId: string
): Promise<
	| { enrollmentAmount: number; courseStripePriceId: string | null }
	| { error: string }
> => {
	const user = await db.query.users.findFirst({
		where: { stripeCustomerId: customerId },
	});

	if (!user) {
		return { error: "unknown customer" };
	}

	const enrollment = await db.query.enrollments.findFirst({
		where: { id: enrollmentId },
		columns: { userId: true, courseId: true, amount: true },
	});

	if (!enrollment) {
		return { error: "unknown enrollment" };
	}

	if (enrollment.userId !== user.id) {
		return { error: "enrollment does not belong to customer" };
	}

	const course = await db.query.courses.findFirst({
		where: { id: enrollment.courseId },
		columns: { id: true, stripePriceId: true },
	});

	if (!course) {
		return { error: "unknown course" };
	}

	return {
		enrollmentAmount: enrollment.amount,
		courseStripePriceId: course.stripePriceId,
	};
};

const handleChargeRefunded = async (
	charge: Stripe.Charge
): Promise<Response> => {
	// Partial refunds keep access; only a full refund revokes it.
	if (charge.amount_refunded < charge.amount) {
		return new Response(null, { status: 200 });
	}

	const paymentIntentId =
		z.string().safeParse(charge.payment_intent).data ??
		z.object({ id: z.string() }).safeParse(charge.payment_intent).data?.id;

	if (!paymentIntentId) {
		return badRequest("missing payment intent");
	}

	const sessions = await stripeClient.checkout.sessions.list({
		payment_intent: paymentIntentId,
		limit: 1,
	});

	const [session] = sessions.data;
	const enrollmentId = session?.metadata?.enrollmentId;
	const customerId = session
		? z.string().safeParse(session.customer).data
		: undefined;

	if (!enrollmentId || !customerId) {
		return badRequest("missing enrollment reference");
	}

	const verified = await verifyEnrollmentOwnership(enrollmentId, customerId);

	if ("error" in verified) {
		return badRequest(verified.error);
	}

	await db
		.update(enrollments)
		.set({ status: "Cancelled" })
		.where(
			and(eq(enrollments.id, enrollmentId), eq(enrollments.status, "Active"))
		);

	return new Response(null, { status: 200 });
};

const handleCheckoutSession = async (
	eventType: string,
	session: Stripe.Checkout.Session
): Promise<Response> => {
	const isFulfillment =
		eventType === "checkout.session.completed" ||
		eventType === "checkout.session.async_payment_succeeded";

	// Async payment methods settle after checkout completes;
	// only fulfill once funds have arrived.
	if (isFulfillment && session.payment_status !== "paid") {
		return new Response(null, { status: 200 });
	}

	const enrollmentId = session.metadata?.enrollmentId;
	const customerId = z.string().safeParse(session.customer).data;

	if (!enrollmentId || !customerId) {
		return badRequest("missing payment data");
	}

	const verified = await verifyEnrollmentOwnership(enrollmentId, customerId);

	if ("error" in verified) {
		return badRequest(verified.error);
	}

	if (isFulfillment) {
		const amount = session.amount_total;

		if (amount === null) {
			return badRequest("missing payment data");
		}

		const lineItems = await stripeClient.checkout.sessions.listLineItems(
			session.id,
			{ limit: 1 }
		);
		const [lineItem] = lineItems.data;
		const paidPriceId =
			z.string().safeParse(lineItem?.price).data ??
			z.object({ id: z.string() }).safeParse(lineItem?.price).data?.id;

		// Accept when the paid price is the course's current price, or
		// when the amount matches what was recorded at checkout: an admin
		// price change in between must not void a valid payment.
		const priceMatches =
			paidPriceId !== undefined &&
			paidPriceId === verified.courseStripePriceId;
		const amountMatches = amount === verified.enrollmentAmount;

		if (!priceMatches && !amountMatches) {
			return badRequest("payment does not match expected purchase");
		}

		await db
			.update(enrollments)
			.set({ amount, status: "Active" })
			.where(
				and(eq(enrollments.id, enrollmentId), eq(enrollments.status, "Pending"))
			);
	} else {
		await db
			.update(enrollments)
			.set({ status: "Cancelled" })
			.where(
				and(eq(enrollments.id, enrollmentId), eq(enrollments.status, "Pending"))
			);
	}

	return new Response(null, { status: 200 });
};

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

						if (event.type === "charge.refunded") {
							return handleChargeRefunded(event.data.object);
						}

						if (
							event.type !== "checkout.session.completed" &&
							event.type !== "checkout.session.async_payment_succeeded" &&
							event.type !== "checkout.session.expired" &&
							event.type !== "checkout.session.async_payment_failed"
						) {
							return new Response(null, { status: 200 });
						}

						return handleCheckoutSession(event.type, event.data.object);
					},
				},
			}),
	},
});
