import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { and, EmptyFilter, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "#/db/index.ts";
import { chapters, courses, lessons } from "#/db/schema/lms.schema.ts";
import { adminMiddleware } from "#/middleware.ts";

import {
	chapterSchema,
	courseIdSchema,
	courseSchema,
	getCoursesQuerySchema,
	lessonSchema,
	reorderChaptersSchema,
	reorderLessonSchema,
	updateCourseSchema,
} from "../schema";

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
			throw notFound();
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
			throw notFound();
		}

		return course;
	});

export const reorderLessons = createServerFn({ method: "POST" })
	.middleware([adminMiddleware])
	.validator(reorderLessonSchema)
	.handler(async ({ data }) => {
		const { chapterId, courseId, lessonArray } = data;

		const chapter = await db.query.chapters.findFirst({
			columns: { courseId: true, id: true },
			where: { id: chapterId },
		});

		if (!chapter || chapter.courseId !== courseId) {
			throw notFound();
		}

		const existingLessons = await db.query.lessons.findMany({
			columns: { id: true },
			where: { chapterId },
		});
		const existingIds = new Set(existingLessons.map((lesson) => lesson.id));
		const allBelongToChapter = lessonArray.every((lesson) =>
			existingIds.has(lesson.id)
		);

		if (!allBelongToChapter) {
			throw new Error("One or more lessons do not belong to this chapter");
		}

		try {
			// neon-http has no interactive transactions, so issue the
			// scoped updates as a batch instead of db.transaction().
			await Promise.all(
				lessonArray.map((lesson) =>
					db
						.update(lessons)
						.set({ position: lesson.position })
						.where(
							and(eq(lessons.id, lesson.id), eq(lessons.chapterId, chapterId))
						)
				)
			);
		} catch (error) {
			throw new Error("Failed to reorder lessons", { cause: error });
		}

		return { updated: lessonArray.length };
	});

export const reorderChapters = createServerFn({ method: "POST" })
	.middleware([adminMiddleware])
	.validator(reorderChaptersSchema)
	.handler(async ({ data }) => {
		const { chaptersArray, courseId } = data;

		const course = await db.query.courses.findFirst({
			columns: { id: true },
			where: { id: courseId },
		});

		if (!course) {
			throw notFound();
		}

		const existingChapters = await db.query.chapters.findMany({
			columns: { id: true },
			where: { courseId },
		});
		const existingIds = new Set(existingChapters.map((chapter) => chapter.id));
		const allBelongToCourse = chaptersArray.every((chapter) =>
			existingIds.has(chapter.id)
		);

		if (!allBelongToCourse) {
			throw new Error("One or more chapters do not belong to this course");
		}

		try {
			// neon-http has no interactive transactions, so issue the
			// scoped updates as a batch instead of db.transaction().
			await Promise.all(
				chaptersArray.map((chapter) =>
					db
						.update(chapters)
						.set({ position: chapter.position })
						.where(
							and(eq(chapters.id, chapter.id), eq(chapters.courseId, courseId))
						)
				)
			);
		} catch (error) {
			throw new Error("Failed to reorder chapters", { cause: error });
		}

		return { updated: chaptersArray.length };
	});

export const createChapter = createServerFn({ method: "POST" })
	.middleware([adminMiddleware])
	.validator(chapterSchema)
	.handler(async ({ data }) => {
		const course = await db.query.courses.findFirst({
			where: { id: data.courseId },
		});
		if (!course) {
			throw notFound();
		}

		try {
			// neon-http has no interactive transactions, so run the
			// max-position lookup and the insert as sequential queries.
			const maxPos = await db.query.chapters.findFirst({
				where: { courseId: data.courseId },
				columns: { position: true },
				orderBy: { position: "desc" },
			});

			const [chapter] = await db
				.insert(chapters)
				.values({
					title: data.name,
					courseId: data.courseId,
					position: (maxPos?.position ?? 0) + 1,
				})
				.returning();

			if (!chapter) {
				throw new Error("Failed to create chapter");
			}

			return { chapter };
		} catch (error) {
			throw new Error("Failed to create chapter", { cause: error });
		}
	});

export const createLesson = createServerFn({ method: "POST" })
	.middleware([adminMiddleware])
	.validator(lessonSchema)
	.handler(async ({ data }) => {
		const course = await db.query.courses.findFirst({
			where: { id: data.courseId },
		});
		if (!course) {
			throw notFound();
		}

		const chapter = await db.query.chapters.findFirst({
			where: { id: data.chapterId },
		});
		if (!chapter || chapter.courseId !== data.courseId) {
			throw notFound();
		}

		try {
			// neon-http has no interactive transactions, so run the
			// max-position lookup and the insert as sequential queries.
			const maxPos = await db.query.lessons.findFirst({
				where: { chapterId: data.chapterId },
				columns: { position: true },
				orderBy: { position: "desc" },
			});

			const [lesson] = await db
				.insert(lessons)
				.values({
					title: data.name,
					chapterId: data.chapterId,
					description: data.description,
					thumbnailKey: data.thumbnailKey,
					videoKey: data.videoKey,
					position: (maxPos?.position ?? 0) + 1,
				})
				.returning();

			if (!lesson) {
				throw new Error("Failed to create lesson");
			}

			return { lesson };
		} catch (error) {
			throw new Error("Failed to create lesson", { cause: error });
		}
	});
