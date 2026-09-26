import { z } from "zod";

import { chapterIdError, courseIdError, lessonIdError } from "./shared";
import { isTiptapJsonString } from "./tiptap";

export const lessonIdSchema = z.object({
	id: z.uuid({ error: lessonIdError }),
});
export type LessonId = z.input<typeof lessonIdSchema>;

export const lessonSchema = z.object({
	name: z.string().min(3, "Name must be at least 3 characters long"),
	courseId: z.uuid({ error: courseIdError }),
	chapterId: z.uuid({ error: chapterIdError }),
	description: z
		.string()
		.min(3, "Description must be at least 3 characters long")
		.refine(isTiptapJsonString, {
			error: "Description must be valid rich text content",
		})
		.optional(),
	thumbnailKey: z.string().optional(),
	videoKey: z.string().optional(),
});
export type LessonInput = z.input<typeof lessonSchema>;

export const updateLessonSchema = lessonSchema
	.partial()
	.extend({ id: z.uuid({ error: lessonIdError }) })
	.refine((value) => Object.keys(value).length > 1, {
		error: "Provide at least one field to update",
	});
export type UpdateLessonInput = z.input<typeof updateLessonSchema>;

export const reorderLessonSchema = z.object({
	chapterId: z.uuid({ error: chapterIdError }),
	courseId: z.uuid({ error: courseIdError }),
	lessonArray: z
		// Min can't be 0 since we reorder everything to begin indexing from 1
		.array(z.object({ id: z.uuid(), position: z.number().int().min(1) }))
		.min(1, { error: "Provide at least one lesson to reorder" }),
});
export type ReorderLessonInput = z.input<typeof reorderLessonSchema>;

export const deleteLessonSchema = z.object({
	courseId: z.uuid({ error: courseIdError }),
	chapterId: z.uuid({ error: chapterIdError }),
	lessonId: z.uuid({ error: lessonIdError }),
});
export type DeleteLessonInput = z.input<typeof deleteLessonSchema>;
