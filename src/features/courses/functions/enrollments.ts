import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getRequest, getRequestHeaders } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { Stripe } from "stripe";

import { db } from "#/db/index.ts";
import { users } from "#/db/schema/auth.schema.ts";
import { enrollments } from "#/db/schema/lms.schema.ts";
import { env } from "#/env.server.ts";
import { ajEnroll, throwIfDenied, toArcjetRequest } from "#/lib/arcjet";
import { auth } from "#/lib/auth.ts";
import { stripeClient } from "#/lib/stripe.ts";
import { authMiddleware } from "#/middleware.ts";

import { enrollInSchema } from "../schema/enrollments";

// Per-user enrollment throttle in front of Stripe: denies bots and caps
// checkout-session creation before any course lookup, DB write, or Stripe
// call. Chains authMiddleware for the session (and its IP backstop).
const enrollmentMiddleware = createMiddleware()
	.middleware([authMiddleware])
	.server(async ({ next, context }) => {
		const decision = await ajEnroll.protect(toArcjetRequest(getRequest()), {
			userId: context.user.id,
		});
		throwIfDenied(decision);

		return next({ context: { user: context.user } });
	});

export const enrollInCourse = createServerFn({ method: "POST" })
	.middleware([enrollmentMiddleware])
	.validator(enrollInSchema)
	.handler(async ({ context, data }) => {
		const { user } = context;
		const { courseId } = data;

		let checkoutUrl: string | null;

		try {
			const course = await db.query.courses.findFirst({
				where: { id: courseId },
				columns: { id: true, title: true, price: true, slug: true },
			});
			if (!course) {
				throw new Error("Course not found");
			}

			let stripeCustomerId: string;

			const userWithStripeCustomerId = await db.query.users.findFirst({
				where: { id: user.id },
				columns: { stripeCustomerId: true },
			});

			if (userWithStripeCustomerId?.stripeCustomerId) {
				({ stripeCustomerId } = userWithStripeCustomerId);
			} else {
				const customer = await stripeClient.customers.create({
					email: user.email,
					name: user.name,
					metadata: {
						userId: user.id,
					},
				});

				stripeCustomerId = customer.id;

				await db
					.update(users)
					.set({ stripeCustomerId })
					.where(eq(users.id, user.id));
			}

			const result = await db.transaction(async (tx) => {
				const existingEnrollment = await tx.query.enrollments.findFirst({
					where: { userId: user.id, courseId },
					columns: { status: true, id: true },
				});

				if (existingEnrollment?.status === "Active") {
					throw new Error("You are already enrolled in this course");
				}

				let enrollment;

				if (existingEnrollment) {
					const [updated] = await tx
						.update(enrollments)
						.set({ amount: course.price, status: "Pending" })
						.where(eq(enrollments.id, existingEnrollment.id))
						.returning();

					enrollment = updated;
				} else {
					const [created] = await tx
						.insert(enrollments)
						.values({
							userId: user.id,
							courseId: course.id,
							amount: course.price,
							status: "Pending",
						})
						.returning();

					enrollment = created;
				}

				const checkoutSession = await stripeClient.checkout.sessions.create({
					customer: stripeCustomerId,
					line_items: [
						{ price: "price_1UJEKgHc4dWacTSigSd1qT6l", quantity: 1 },
					],
					mode: "payment",
					success_url: `${env.BETTER_AUTH_URL}/payment/success`,
					cancel_url: `${env.BETTER_AUTH_URL}/payment/cancel`,
					metadata: {
						userId: user.id,
						courseId,
						enrollmentId: enrollment.id,
					},
				});

				return { enrollment, checkoutUrl: checkoutSession.url };
			});

			({ checkoutUrl } = result);

			return { data: { checkoutUrl } };
		} catch (error) {
			if (error instanceof Stripe.errors.StripeError) {
				throw new TypeError("Payment error", { cause: error });
			}

			throw new Error("Failed to enroll in course", { cause: error });
		}
	});

export const checkIfCourseBought = createServerFn({ method: "GET" })
	.validator(enrollInSchema)
	.handler(async ({ data }) => {
		const headers = getRequestHeaders();

		const session = await auth.api.getSession({ headers });
		if (!session?.user) {
			return false;
		}

		const enrollment = await db.query.enrollments.findFirst({
			where: {
				userId: session.user.id,
				courseId: data.courseId,
			},
			columns: { status: true },
		});

		// oxlint-disable-next-line no-unneeded-ternary
		return enrollment?.status === "Active" ? true : false;
	});
