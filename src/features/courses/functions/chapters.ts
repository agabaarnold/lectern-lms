import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";

import { db } from "#/db/index.ts";
import { chapters } from "#/db/schema/lms.schema.ts";
import { adminMiddleware } from "#/middleware.ts";

import {
	chapterSchema,
	deleteChapterSchema,
	reorderChaptersSchema,
} from "../schema/chapters";
import { CHAPTER_NOT_FOUND_MESSAGE, COURSE_NOT_FOUND_MESSAGE } from "./shared";

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
			setResponseStatus(404);
			throw new Error(COURSE_NOT_FOUND_MESSAGE);
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
			setResponseStatus(404);
			throw new Error(COURSE_NOT_FOUND_MESSAGE);
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

export const deleteChapter = createServerFn({ method: "POST" })
	.middleware([adminMiddleware])
	.validator(deleteChapterSchema)
	.handler(async ({ data }) => {
		const courseWithChapters = await db.query.courses.findFirst({
			where: { id: data.courseId },
			with: { chapters: { orderBy: { position: "desc" } } },
		});
		if (!courseWithChapters) {
			setResponseStatus(404);
			throw new Error(COURSE_NOT_FOUND_MESSAGE);
		}

		const { chapters: allChapters } = courseWithChapters;

		const chapterToDelete = allChapters.find(
			(chapter) => chapter.id === data.chapterId
		);
		if (!chapterToDelete) {
			setResponseStatus(404);
			throw new Error(CHAPTER_NOT_FOUND_MESSAGE);
		}

		try {
			const remainingChapters = allChapters.filter(
				(chapter) => chapter.id !== data.chapterId
			);

			const renumber = remainingChapters.map((chapter, index) =>
				db
					.update(chapters)
					.set({
						position: index + 1,
					})
					.where(eq(chapters.id, chapter.id))
			);

			// neon-http has no interactive transactions, so issue the
			// scoped delete and renumbering as a batch instead of
			// db.transaction(). Lessons belonging to the deleted chapter
			// are removed by the foreign key cascade.
			await Promise.all([
				...renumber,
				db
					.delete(chapters)
					.where(
						and(
							eq(chapters.id, data.chapterId),
							eq(chapters.courseId, data.courseId)
						)
					),
			]);
		} catch (error) {
			throw new Error("Failed to delete chapter", { cause: error });
		}

		return { deleted: data.chapterId };
	});
