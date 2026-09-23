import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { EmptyFilter, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "#/db/index.ts";
import { courses } from "#/db/schema/lms.schema.ts";
import { adminMiddleware } from "#/middleware.ts";

import {
	courseIdSchema,
	courseSchema,
	getCoursesQuerySchema,
	updateCourseSchema,
} from "../schema/courses";
import { COURSE_NOT_FOUND_MESSAGE } from "./shared";

const SLUG_CONFLICT_MESSAGE = "A course with this slug already exists";

const uniqueViolationSchema = z.object({ code: z.literal("23505") });

const normalizeSlug = (slug: string) => slug.trim().toLowerCase();

type CourseRow = typeof courses.$inferSelect;

export const createCourse = createServerFn({ method: "POST" })
	.middleware([adminMiddleware])
	.validator(courseSchema)
	.handler(async ({ context, data }) => {
		let inserted: CourseRow[];

		try {
			inserted = await db
				.insert(courses)
				.values({
					...data,
					slug: normalizeSlug(data.slug),
					userId: context.user.id,
				})
				.returning();
		} catch (error) {
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

		let updated: CourseRow[];

		try {
			updated = await db
				.update(courses)
				.set(patch)
				.where(eq(courses.id, id))
				.returning();
		} catch (error) {
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
		let deleted: CourseRow[];

		try {
			deleted = await db
				.delete(courses)
				.where(eq(courses.id, data.id))
				.returning();
		} catch (error) {
			throw new Error("Failed to delete course", { cause: error });
		}

		const [course] = deleted;

		if (!course) {
			setResponseStatus(404);
			throw new Error(COURSE_NOT_FOUND_MESSAGE);
		}

		return course;
	});
