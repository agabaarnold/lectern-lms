import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { EmptyFilter, eq } from "drizzle-orm";
import { z } from "zod";

import { clientEnv } from "#/client-env.ts";
import { db } from "#/db/index.ts";
import { courses } from "#/db/schema/lms.schema.ts";
import { S3 } from "#/lib/s3-client.ts";
import { stripeClient } from "#/lib/stripe.ts";
import {
	adminMiddleware,
	arcjetMiddleware,
	authMiddleware,
} from "#/middleware.ts";

import {
	courseIdSchema,
	courseSchema,
	courseSearchSchema,
	getCourseSidebarCourseData,
	getCoursesQuerySchema,
	getIndividualCourseSchema,
	updateCourseSchema,
} from "../schema/courses";
import { COURSE_NOT_FOUND_MESSAGE } from "./shared";

const SLUG_CONFLICT_MESSAGE = "A course with this slug already exists";

const uniqueViolationSchema = z.object({ code: z.literal("23505") });

const normalizeSlug = (slug: string) => slug.trim().toLowerCase();

const createPricedProduct = async (
	name: string,
	description: string,
	amount: number
): Promise<string> => {
	const product = await stripeClient.products.create({
		name,
		description,
		default_price_data: { currency: "ugx", unit_amount: amount },
	});

	const parsedPriceId = z.string().safeParse(product.default_price);

	if (!parsedPriceId.success) {
		throw new TypeError("Failed to create course pricing");
	}

	return parsedPriceId.data;
};

const fetchStripePrice = async (priceId: string) => {
	try {
		return await stripeClient.prices.retrieve(priceId);
	} catch {
		return null;
	}
};

// Stripe prices are immutable: a price change mints a new price on the same
// product and points the course at it. Returns the new price id, or
// undefined when Stripe already matches (this also heals pre-existing
// mismatches, since the comparison is against Stripe, not the database).
const resolveStripePriceId = async (
	course: {
		title: string;
		smallDescription: string;
		price: number;
		stripePriceId: string | null;
	},
	newPrice: number
): Promise<string | undefined> => {
	const stripePrice = course.stripePriceId
		? await fetchStripePrice(course.stripePriceId)
		: null;

	if (!stripePrice) {
		return createPricedProduct(course.title, course.smallDescription, newPrice);
	}

	if (stripePrice.unit_amount === newPrice) {
		return undefined;
	}

	const productId =
		z.string().safeParse(stripePrice.product).data ??
		z.object({ id: z.string() }).safeParse(stripePrice.product).data?.id;

	if (!productId) {
		return createPricedProduct(course.title, course.smallDescription, newPrice);
	}

	const price = await stripeClient.prices.create({
		product: productId,
		currency: "ugx",
		unit_amount: newPrice,
	});

	return price.id;
};

type CourseRow = typeof courses.$inferSelect;

// Stripe prices are immutable, so a course can point at the latest of
// several prices on one product. Deactivate every active price and
// archive the product so a deleted course can never be purchased again.
const archiveCourseStripeResources = async (
	stripePriceId: string | null
): Promise<void> => {
	if (!stripePriceId) {
		return;
	}

	const stripePrice = await fetchStripePrice(stripePriceId);

	if (!stripePrice) {
		return;
	}

	const productId =
		z.string().safeParse(stripePrice.product).data ??
		z.object({ id: z.string() }).safeParse(stripePrice.product).data?.id;

	if (!productId) {
		return;
	}

	const prices = await stripeClient.prices.list({
		product: productId,
		active: true,
		limit: 100,
	});

	await Promise.all(
		prices.data.map((price) =>
			stripeClient.prices.update(price.id, { active: false })
		)
	);

	await stripeClient.products.update(productId, { active: false });
};

interface CourseStorageObjects {
	fileKey: string;
	chapters: {
		lessons: {
			thumbnailKey: string | null;
			videoKey: string | null;
		}[];
	}[];
}

const deleteCourseStorageObjects = async (
	course: CourseStorageObjects
): Promise<void> => {
	const keys = new Set<string>([course.fileKey]);

	for (const chapter of course.chapters) {
		for (const lesson of chapter.lessons) {
			if (lesson.thumbnailKey) {
				keys.add(lesson.thumbnailKey);
			}

			if (lesson.videoKey) {
				keys.add(lesson.videoKey);
			}
		}
	}

	if (keys.size === 0) {
		return;
	}

	const result = await S3.send(
		new DeleteObjectsCommand({
			Bucket: clientEnv.VITE_S3_BUCKET_NAME_IMAGES,
			Delete: { Objects: [...keys].map((Key) => ({ Key })) },
		})
	);

	// Multi-object delete reports per-key failures in the response
	// without throwing, so inspect them: proceeding with failed keys
	// would orphan course files.
	const failures = result.Errors ?? [];

	if (failures.length > 0) {
		const failedKeys = failures.map((failure) => failure.Key).join(", ");
		throw new Error(`Failed to delete course files: ${failedKeys}`);
	}
};

export const createCourse = createServerFn({ method: "POST" })
	.middleware([adminMiddleware])
	.validator(courseSchema)
	.handler(async ({ context, data }) => {
		let inserted: CourseRow[];
		let createdPriceId: string | null = null;

		try {
			const stripeData = await stripeClient.products.create({
				name: data.title,
				description: data.smallDescription,
				default_price_data: { currency: "ugx", unit_amount: data.price },
			});

			const stripePriceId = z.string().safeParse(stripeData.default_price);

			if (!stripePriceId.success) {
				throw new TypeError("Failed to create course pricing");
			}

			createdPriceId = stripePriceId.data;

			inserted = await db
				.insert(courses)
				.values({
					...data,
					slug: normalizeSlug(data.slug),
					userId: context.user.id,
					stripePriceId: createdPriceId,
				})
				.returning();
		} catch (error) {
			// The Stripe product/price already exists at this point, so a
			// database failure would orphan it. Clean up best-effort: the
			// original error below is what the caller sees.
			if (createdPriceId) {
				try {
					await archiveCourseStripeResources(createdPriceId);
				} catch (cleanupError) {
					console.error(
						"Failed to clean up Stripe resources after course creation failure",
						cleanupError
					);
				}
			}

			const cause = error instanceof Error ? error.cause : undefined;
			const isConflict =
				uniqueViolationSchema.safeParse(error).success ||
				uniqueViolationSchema.safeParse(cause).success;

			if (isConflict) {
				setResponseStatus(409);
				throw new Error(SLUG_CONFLICT_MESSAGE, { cause: error });
			}

			throw new Error("Failed to create course", { cause: error });
		}

		const [course] = inserted;

		if (!course) {
			throw new Error("Failed to create course");
		}

		return course;
	});

export const getCourses = createServerFn({ method: "GET" })
	.middleware([adminMiddleware])
	.validator(getCoursesQuerySchema.optional())
	.handler(async ({ data }) => {
		const { limit, offset, status } = getCoursesQuerySchema.parse(data ?? {});

		const courseList = await db.query.courses.findMany({
			where: status === undefined ? EmptyFilter : { status },
			orderBy: { createdAt: "desc" },
			limit,
			offset,
		});

		return courseList;
	});

export const getCourse = createServerFn({ method: "GET" })
	.middleware([adminMiddleware])
	.validator(courseIdSchema)
	.handler(async ({ data }) => {
		const course = await db.query.courses.findFirst({
			where: { id: data.id },
			with: {
				chapters: {
					columns: { id: true, title: true, position: true },
					orderBy: { position: "asc" },
					with: {
						lessons: {
							columns: {
								id: true,
								title: true,
								description: true,
								thumbnailKey: true,
								position: true,
								videoKey: true,
							},
							orderBy: { position: "asc" },
						},
					},
				},
			},
		});

		if (!course) {
			throw notFound();
		}

		return course;
	});

export const updateCourse = createServerFn({ method: "POST" })
	.middleware([adminMiddleware])
	.validator(updateCourseSchema)
	.handler(async ({ data }) => {
		const { id, ...patch } = data;

		if (patch.slug !== undefined) {
			patch.slug = normalizeSlug(patch.slug);
		}

		let stripePriceId: string | undefined;

		if (patch.price !== undefined) {
			const current = await db.query.courses.findFirst({
				where: { id },
				columns: {
					title: true,
					smallDescription: true,
					price: true,
					stripePriceId: true,
				},
			});

			if (!current) {
				setResponseStatus(404);
				throw new Error(COURSE_NOT_FOUND_MESSAGE);
			}

			stripePriceId = await resolveStripePriceId(current, patch.price);
		}

		const updateData =
			stripePriceId === undefined ? patch : { ...patch, stripePriceId };

		let updated: CourseRow[];

		try {
			updated = await db
				.update(courses)
				.set(updateData)
				.where(eq(courses.id, id))
				.returning();
		} catch (error) {
			// stripePriceId is only set when a new price was minted above,
			// so a failed update would orphan it. Deactivate best-effort.
			if (stripePriceId) {
				try {
					await stripeClient.prices.update(stripePriceId, {
						active: false,
					});
				} catch (cleanupError) {
					console.error(
						"Failed to deactivate Stripe price after course update failure",
						cleanupError
					);
				}
			}

			const cause = error instanceof Error ? error.cause : undefined;
			const isConflict =
				uniqueViolationSchema.safeParse(error).success ||
				uniqueViolationSchema.safeParse(cause).success;

			if (isConflict) {
				setResponseStatus(409);
				throw new Error(SLUG_CONFLICT_MESSAGE, { cause: error });
			}

			throw new Error("Failed to update course", { cause: error });
		}

		const [course] = updated;

		if (!course) {
			setResponseStatus(404);
			throw new Error(COURSE_NOT_FOUND_MESSAGE);
		}

		return course;
	});

export const deleteCourse = createServerFn({ method: "POST" })
	.middleware([adminMiddleware])
	.validator(courseIdSchema)
	.handler(async ({ data }) => {
		const course = await db.query.courses.findFirst({
			where: { id: data.id },
			columns: { id: true, fileKey: true, stripePriceId: true },
			with: {
				chapters: {
					columns: { id: true },
					with: {
						lessons: {
							columns: { thumbnailKey: true, videoKey: true },
						},
					},
				},
			},
		});

		if (!course) {
			setResponseStatus(404);
			throw new Error(COURSE_NOT_FOUND_MESSAGE);
		}

		// Clean up external resources before the database row: if Stripe
		// or S3 fails, the course still exists and the delete can be
		// retried instead of leaving orphaned resources behind.
		try {
			await archiveCourseStripeResources(course.stripePriceId);
			await deleteCourseStorageObjects(course);
		} catch (error) {
			throw new Error("Failed to clean up course resources", {
				cause: error,
			});
		}

		let deleted: CourseRow[];

		try {
			deleted = await db
				.delete(courses)
				.where(eq(courses.id, data.id))
				.returning();
		} catch (error) {
			throw new Error("Failed to delete course", { cause: error });
		}

		const [deletedCourse] = deleted;

		if (!deletedCourse) {
			setResponseStatus(404);
			throw new Error(COURSE_NOT_FOUND_MESSAGE);
		}

		return deletedCourse;
	});

// Not protected for pulic course route
export const getAllCourses = createServerFn({ method: "GET" })
	.middleware([arcjetMiddleware])
	.validator(courseSearchSchema)
	.handler(async ({ data }) => {
		const sanitizedQuery = data.q?.replaceAll(/[\\%_]/gu, "");
		const pattern =
			sanitizedQuery === undefined || sanitizedQuery === ""
				? undefined
				: `%${sanitizedQuery}%`;

		const courseList = await db.query.courses.findMany({
			where:
				pattern === undefined
					? { status: "Published" }
					: {
							status: "Published",
							OR: [
								{ title: { ilike: pattern } },
								{ smallDescription: { ilike: pattern } },
								{ category: { ilike: pattern } },
							],
						},
			columns: {
				title: true,
				price: true,
				smallDescription: true,
				slug: true,
				fileKey: true,
				id: true,
				level: true,
				duration: true,
				category: true,
			},
			orderBy: { createdAt: "desc" },
		});

		return courseList;
	});

export const getIndividualCourse = createServerFn({ method: "GET" })
	.middleware([arcjetMiddleware])
	.validator(getIndividualCourseSchema)
	.handler(async ({ data }) => {
		const course = await db.query.courses.findFirst({
			where: { slug: data.slug, status: "Published" },
			columns: {
				title: true,
				price: true,
				smallDescription: true,
				description: true,
				slug: true,
				fileKey: true,
				id: true,
				level: true,
				duration: true,
				category: true,
			},
			with: {
				chapters: {
					columns: { id: true, title: true },
					orderBy: { position: "asc" },
					with: {
						lessons: {
							columns: { id: true, title: true },
							orderBy: { position: "asc" },
						},
					},
				},
			},
		});

		if (!course) {
			throw notFound();
		}

		return course;
	});

export const getCourseSiderbarData = createServerFn()
	.middleware([authMiddleware])
	.validator(getCourseSidebarCourseData)
	.handler(async ({ context, data }) => {
		const { user } = context;
		const { slug } = data;

		const course = await db.query.courses.findFirst({
			where: { slug },
			columns: {
				id: true,
				title: true,
				slug: true,
				fileKey: true,
				category: true,
				duration: true,
				level: true,
			},
			with: {
				chapters: {
					columns: { id: true, title: true, position: true },
					orderBy: { position: "asc" },
					with: {
						lessons: {
							columns: {
								id: true,
								title: true,
								description: true,
								position: true,
							},
							with: {
								lessonProgress: {
									where: { userId: user.id },
									columns: { completed: true, lessonId: true, id: true },
								},
							},
						},
					},
				},
			},
		});

		if (!course) {
			throw notFound();
		}

		const enrollment = await db.query.enrollments.findFirst({
			where: { userId: user.id, courseId: course.id },
		});

		if (!enrollment || enrollment.status !== "Active") {
			throw notFound();
		}

		return { course };
	});
