import { z } from "zod";

import { chapterIdError, courseIdError } from "./shared";

export const chapterSchema = z.object({
	name: z.string().min(3, "Name must be at least 3 characters long"),
	courseId: z.uuid({ error: courseIdError }),
});
export type ChapterInput = z.input<typeof chapterSchema>;

export const reorderChaptersSchema = z.object({
	courseId: z.uuid({ error: courseIdError }),
	chaptersArray: z
		// Min can't be 0 since we reorder everything to begin indexing from 1
		.array(
			z.object({
				id: z.uuid({ error: chapterIdError }),
				position: z.number().int().min(1),
			})
		)
		.min(1, { error: "Provide at least one chapter to reorder" }),
});
export type ReorderChaptersInput = z.input<typeof reorderChaptersSchema>;

export const deleteChapterSchema = z.object({
	courseId: z.uuid({ error: courseIdError }),
	chapterId: z.uuid({ error: chapterIdError }),
});
export type DeleteChapterInput = z.input<typeof deleteChapterSchema>;
