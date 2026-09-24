import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import id from "zod/v4/locales/id.cjs";

import { db } from "#/db/index.ts";
import { users } from "#/db/schema/auth.schema.ts";
import { stripeClient } from "#/lib/stripe.ts";
import { authMiddleware } from "#/middleware.ts";

import { enrollInSchema } from "../schema/enrollments";

export const enrollInCourse = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(enrollInSchema)
	.handler(async ({ context, data }) => {
		const { user } = context;
		const { courseId } = data;

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

			if (userWithStripeCustomerId) {
				stripeCustomerId = userWithStripeCustomerId.stripeCustomerId;
			} else {
				const customer = await stripeClient.customers.create({
					email: user.email,
					name: user.name,
					metadata: {
						userId: user.id,
					},
				});

				stripeCustomerId = customer.id;

				const updated = await db
					.update(users)
					.set({ stripeCustomerId })
					.where(eq(user.id, id));

				const updatedUser = [updated];

				return updatedUser;
			}
		} catch (error) {
			throw new Error("Failed to enroll in course", { cause: error });
		}
	});
