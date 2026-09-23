import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";

import { db } from "#/db/index.ts";
import { lessons } from "#/db/schema/lms.schema.ts";
import { adminMiddleware } from "#/middleware.ts";

import {
	deleteLessonSchema,
	lessonIdSchema,
	lessonSchema,
	reorderLessonSchema,
} from "../schema/lessons";
import {
	CHAPTER_NOT_FOUND_MESSAGE,
	COURSE_NOT_FOUND_MESSAGE,
	LESSON_NOT_FOUND_MESSAGE,
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
