import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";

import { db } from "#/db/index.ts";
import { lessonProgress, lessons } from "#/db/schema/lms.schema.ts";
import { adminMiddleware, authMiddleware } from "#/middleware.ts";

import {
	deleteLessonSchema,
	lessonIdSchema,
	lessonSchema,
	reorderLessonSchema,
	updateLessonSchema,
} from "../schema/lessons";
import {
	CHAPTER_NOT_FOUND_MESSAGE,
	COURSE_NOT_FOUND_MESSAGE,
	LESSON_NOT_FOUND_MESSAGE,
	requireActiveEnrollment,
} from "./shared";

export const getLesson = createServerFn({ method: "GET" })
	.middleware([adminMiddleware])
	.validator(lessonIdSchema)
	.handler(async ({ data }) => {
		const lesson = await db.query.lessons.findFirst({
			where: { id: data.id },
			with: {
				chapter: {
					columns: { courseId: true, id: true, title: true },
					with: {
						course: {
							columns: { id: true, title: true },
						},
					},
				},
			},
		});

		if (!lesson) {
			throw notFound();
		}

		return lesson;
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
			setResponseStatus(404);
			throw new Error(CHAPTER_NOT_FOUND_MESSAGE);
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

export const createLesson = createServerFn({ method: "POST" })
	.middleware([adminMiddleware])
	.validator(lessonSchema)
	.handler(async ({ data }) => {
		const course = await db.query.courses.findFirst({
			where: { id: data.courseId },
		});
		if (!course) {
			setResponseStatus(404);
			throw new Error(COURSE_NOT_FOUND_MESSAGE);
		}

		const chapter = await db.query.chapters.findFirst({
			where: { id: data.chapterId },
		});
		if (!chapter || chapter.courseId !== data.courseId) {
			setResponseStatus(404);
			throw new Error(CHAPTER_NOT_FOUND_MESSAGE);
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

export const deleteLesson = createServerFn({ method: "POST" })
	.middleware([adminMiddleware])
	.validator(deleteLessonSchema)
	.handler(async ({ data }) => {
		const chapterWithLessons = await db.query.chapters.findFirst({
			where: { id: data.chapterId },
			with: { lessons: { orderBy: { position: "desc" } } },
		});
		if (!chapterWithLessons || chapterWithLessons.courseId !== data.courseId) {
			setResponseStatus(404);
			throw new Error(CHAPTER_NOT_FOUND_MESSAGE);
		}

		const { lessons: allLessons } = chapterWithLessons;

		const lessonToDelete = allLessons.find(
			(lesson) => lesson.id === data.lessonId
		);
		if (!lessonToDelete) {
			setResponseStatus(404);
			throw new Error(LESSON_NOT_FOUND_MESSAGE);
		}

		try {
			const remainingLessons = allLessons.filter(
				(lesson) => lesson.id !== data.lessonId
			);

			const renumber = remainingLessons.map((lesson, index) =>
				db
					.update(lessons)
					.set({
						position: index + 1,
					})
					.where(eq(lessons.id, lesson.id))
			);

			// neon-http has no interactive transactions, so issue the
			// scoped delete and renumbering as a batch instead of
			// db.transaction().
			await Promise.all([
				...renumber,
				db
					.delete(lessons)
					.where(
						and(
							eq(lessons.id, data.lessonId),
							eq(lessons.chapterId, data.chapterId)
						)
					),
			]);
		} catch (error) {
			throw new Error("Failed to delete lesson", { cause: error });
		}

		return { deleted: data.lessonId };
	});

export const updateLesson = createServerFn({ method: "POST" })
	.middleware([adminMiddleware])
	.validator(updateLessonSchema)
	.handler(async ({ data }) => {
		const { id, courseId, chapterId, name, ...rest } = data;

		const lesson = await db.query.lessons.findFirst({
			where: { id },
			with: {
				chapter: {
					columns: { courseId: true, id: true },
				},
			},
		});

		if (!lesson || !lesson.chapter) {
			setResponseStatus(404);
			throw new Error(LESSON_NOT_FOUND_MESSAGE);
		}

		const { chapter } = lesson;

		if (
			(chapterId !== undefined && chapter.id !== chapterId) ||
			(courseId !== undefined && chapter.courseId !== courseId)
		) {
			setResponseStatus(404);
			throw new Error(CHAPTER_NOT_FOUND_MESSAGE);
		}

		const patch = name === undefined ? { ...rest } : { ...rest, title: name };

		if (Object.keys(patch).length === 0) {
			throw new Error("Provide at least one field to update");
		}

		let updated: (typeof lessons.$inferSelect)[];

		try {
			updated = await db
				.update(lessons)
				.set(patch)
				.where(eq(lessons.id, id))
				.returning();
		} catch (error) {
			throw new Error("Failed to update lesson", { cause: error });
		}

		const [updatedLesson] = updated;

		if (!updatedLesson) {
			setResponseStatus(404);
			throw new Error(LESSON_NOT_FOUND_MESSAGE);
		}

		return updatedLesson;
	});

export const getLessonContent = createServerFn()
	.middleware([authMiddleware])
	.validator(lessonIdSchema)
	.handler(async ({ context, data }) => {
		const lesson = await db.query.lessons.findFirst({
			where: { id: data.id },
			columns: {
				id: true,
				title: true,
				description: true,
				position: true,
				thumbnailKey: true,
				videoKey: true,
			},
			with: {
				chapter: { columns: { courseId: true } },
				lessonProgress: {
					where: { userId: context.user.id },
					columns: { completed: true, lessonId: true },
				},
			},
		});

		if (!lesson) {
			throw notFound();
		}

		const enrollment = await db.query.enrollments.findFirst({
			where: { userId: context.user.id, courseId: lesson.chapter.courseId },
			columns: { status: true },
		});

		// No Published check by design: the Active enrollment below gates
		// access, so learners keep what they paid for if a course is
		// later archived. See getCourseSiderbarData for the full invariant.
		if (!enrollment || enrollment.status !== "Active") {
			throw notFound();
		}

		return { lesson };
	});

export const markLessonComplete = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(lessonIdSchema)
	.handler(async ({ context, data }) => {
		const { user } = context;

		const lesson = await db.query.lessons.findFirst({
			where: { id: data.id },
			columns: { id: true },
			with: { chapter: { columns: { courseId: true } } },
		});

		if (!lesson) {
			setResponseStatus(404);
			throw new Error(LESSON_NOT_FOUND_MESSAGE);
		}

		await requireActiveEnrollment(user.id, lesson.chapter.courseId);

		try {
			await db
				.insert(lessonProgress)
				.values({ userId: user.id, lessonId: data.id, completed: true })
				.onConflictDoUpdate({
					target: [lessonProgress.userId, lessonProgress.lessonId],
					set: { completed: true },
				});
		} catch (error) {
			throw new Error("Failed to mark lesson as complete", { cause: error });
		}
	});
