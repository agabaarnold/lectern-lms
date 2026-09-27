import { createHash } from "node:crypto";

import { createMiddleware, createServerFn } from "@tanstack/react-start";
import {
	getRequest,
	getRequestHeaders,
	setResponseStatus,
} from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { Stripe } from "stripe";
import { z } from "zod";

import { db } from "#/db/index.ts";
import { users } from "#/db/schema/auth.schema.ts";
import { enrollments } from "#/db/schema/lms.schema.ts";
import { env } from "#/env.server.ts";
import { ajEnroll, throwIfDenied, toArcjetRequest } from "#/lib/arcjet";
import { auth } from "#/lib/auth.ts";
import { stripeClient } from "#/lib/stripe.ts";
import { authMiddleware } from "#/middleware.ts";

import { courseSearchSchema } from "../schema/courses";
import { enrollInSchema } from "../schema/enrollments";

const uniqueViolationSchema = z.object({ code: z.literal("23505") });

// Stripe idempotency keys can only be reused with byte-identical params.
// A bare `checkout-${enrollmentId}` poisons retries for 24h as soon as any
// param drifts (price change, new customer, changed success/cancel URL).
// Hashing the request params into the key keeps dedup for identical
// retries while letting changed checkouts create a fresh session.
const hashParams = (value: string): string =>
	createHash("sha256").update(value).digest("hex").slice(0, 32);

const isIdempotencyError = (error: Stripe.errors.StripeError): boolean =>
	error instanceof Stripe.errors.StripeIdempotencyError ||
	error.type === "idempotency_error";

const logStripeError = (
	operation: string,
	error: Stripe.errors.StripeError,
	extra: Record<string, string>
): void => {
	console.error(operation, {
		...extra,
		type: error.type,
		code: error.code,
		param: error.param,
		message: error.message,
		requestId: error.requestId,
		statusCode: error.statusCode,
	});
};

// NOTE: no db.transaction here — the neon-http driver does not support
// transactions, and the Stripe call below must not run inside one anyway.
// The user_course_unique constraint turns a lost insert race into a
// catchable conflict instead of a duplicate row.
const resolvePendingEnrollment = async (
	userId: string,
	course: { id: string; price: number }
) => {
	const existingEnrollment = await db.query.enrollments.findFirst({
		where: { userId, courseId: course.id },
		columns: { status: true, id: true },
	});

	if (existingEnrollment?.status === "Active") {
		throw new Error("You are already enrolled in this course");
	}

	if (existingEnrollment) {
		const [updated] = await db
			.update(enrollments)
			.set({ amount: course.price, status: "Pending" })
			.where(eq(enrollments.id, existingEnrollment.id))
			.returning();

		return updated;
	}

	try {
		const [created] = await db
			.insert(enrollments)
			.values({
				userId,
				courseId: course.id,
				amount: course.price,
				status: "Pending",
			})
			.returning();

		return created;
	} catch (error) {
		// A concurrent request won the race: reuse the winning row.
		const cause = error instanceof Error ? error.cause : undefined;
		const isConflict =
			uniqueViolationSchema.safeParse(error).success ||
			uniqueViolationSchema.safeParse(cause).success;

		if (!isConflict) {
			throw error;
		}

		const winner = await db.query.enrollments.findFirst({
			where: { userId, courseId: course.id },
			columns: { status: true, id: true },
		});

		if (!winner) {
			throw error;
		}

		if (winner.status === "Active") {
			throw new Error("You are already enrolled in this course", {
				cause: error,
			});
		}

		const [updated] = await db
			.update(enrollments)
			.set({ amount: course.price, status: "Pending" })
			.where(eq(enrollments.id, winner.id))
			.returning();

		return updated;
	}
};

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
				where: { id: courseId, status: "Published" },
				columns: {
					id: true,
					title: true,
					price: true,
					slug: true,
					stripePriceId: true,
				},
			});
			if (!course) {
				throw new Error("Course not found");
			}

			if (!course.stripePriceId) {
				throw new Error("Course pricing is not configured");
			}

			let stripeCustomerId: string;

			const userWithStripeCustomerId = await db.query.users.findFirst({
				where: { id: user.id },
				columns: { stripeCustomerId: true },
			});

			if (userWithStripeCustomerId?.stripeCustomerId) {
				({ stripeCustomerId } = userWithStripeCustomerId);
			} else {
				// Key binds the user to the exact customer params: identical
				// retries reuse the customer, a changed email/name mints a
				// new key instead of hitting an idempotency_error.
				const customerParams = `${user.email}|${user.name}`;
				const customerKey = `user-customer-${user.id}-${hashParams(customerParams)}`;
				const customer = await stripeClient.customers.create(
					{
						email: user.email,
						name: user.name,
						metadata: {
							userId: user.id,
						},
					},
					{ idempotencyKey: customerKey }
				);

				stripeCustomerId = customer.id;

				await db
					.update(users)
					.set({ stripeCustomerId })
					.where(eq(users.id, user.id));
			}

			const enrollment = await resolvePendingEnrollment(user.id, course);

			const successUrl = `${env.BETTER_AUTH_URL}/payment/success`;
			const cancelUrl = `${env.BETTER_AUTH_URL}/payment/cancel`;

			// resolvePendingEnrollment reuses the existing pending enrollment
			// for this user+course, so the key binds the enrollment to the
			// exact checkout params. Identical retries return the same
			// session; changed params (new price, customer, URLs) mint a
			// fresh key instead of a 400 idempotency_error.
			const checkoutKeyMaterial = [
				enrollment.id,
				course.stripePriceId,
				stripeCustomerId,
				String(course.price),
				successUrl,
				cancelUrl,
				user.id,
				courseId,
			].join("|");
			const checkoutSession = await stripeClient.checkout.sessions.create(
				{
					customer: stripeCustomerId,
					line_items: [{ price: course.stripePriceId, quantity: 1 }],
					mode: "payment",
					success_url: successUrl,
					cancel_url: cancelUrl,
					metadata: {
						userId: user.id,
						courseId,
						enrollmentId: enrollment.id,
					},
				},
				{
					idempotencyKey: `checkout-${enrollment.id}-${hashParams(checkoutKeyMaterial)}`,
				}
			);

			const result = { enrollment, checkoutUrl: checkoutSession.url };

			({ checkoutUrl } = result);

			return { data: { checkoutUrl } };
		} catch (error) {
			if (error instanceof Stripe.errors.StripeError) {
				logStripeError("enrollInCourse Stripe error", error, {
					userId: user.id,
					courseId,
				});

				if (isIdempotencyError(error)) {
					setResponseStatus(409);
					throw new Error(
						"Checkout conflicted with a previous attempt. Please try again.",
						{ cause: error }
					);
				}

				if (
					error.param === "line_items[0][price]" ||
					error.code === "resource_missing"
				) {
					setResponseStatus(422);
					throw new Error(
						"Course pricing is not configured correctly. Please contact support.",
						{ cause: error }
					);
				}

				throw new TypeError("Payment error", { cause: error });
			}

			// Domain errors thrown above carry their own user-facing message;
			// preserve them instead of wrapping into a generic failure.
			if (error instanceof Error) {
				throw error;
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

export const getEnrolledCourses = createServerFn()
	.middleware([authMiddleware])
	.validator(courseSearchSchema)
	.handler(async ({ context, data }) => {
		const { user } = context;
		const sanitizedQuery = data.q?.replaceAll(/[\\%_]/gu, "");
		const pattern =
			sanitizedQuery === undefined || sanitizedQuery === ""
				? undefined
				: `%${sanitizedQuery}%`;

		const userEnrolledCourses = await db.query.enrollments.findMany({
			where:
				pattern === undefined
					? { userId: user.id, status: "Active" }
					: {
							userId: user.id,
							status: "Active",
							course: {
								OR: [
									{ title: { ilike: pattern } },
									{ smallDescription: { ilike: pattern } },
									{ category: { ilike: pattern } },
								],
							},
						},
			with: {
				course: {
					columns: {
						id: true,
						smallDescription: true,
						title: true,
						fileKey: true,
						slug: true,
						duration: true,
						level: true,
					},
					with: {
						chapters: {
							columns: { id: true },
							with: {
								lessons: {
									columns: { id: true },
									with: {
										lessonProgress: {
											where: { userId: user.id },
											columns: { id: true, completed: true, lessonId: true },
										},
									},
								},
							},
						},
					},
				},
			},
		});

		return userEnrolledCourses;
	});
