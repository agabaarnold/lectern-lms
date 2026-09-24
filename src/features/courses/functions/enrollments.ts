import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { Stripe } from "stripe";

import { db } from "#/db/index.ts";
import { users } from "#/db/schema/auth.schema.ts";
import { enrollments } from "#/db/schema/lms.schema.ts";
import { env } from "#/env.server.ts";
import { stripeClient } from "#/lib/stripe.ts";
import { authMiddleware } from "#/middleware.ts";

import { enrollInSchema } from "../schema/enrollments";

export const enrollInCourse = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
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
