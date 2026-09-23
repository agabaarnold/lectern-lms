import { z } from "zod";

export const courseLevels = ["Beginner", "Intermediate", "Advanced"] as const;
export const courseStatus = ["Draft", "Published", "Archived"] as const;

export const CourseCategories = [
	"Development",
	"Business",
	"Finance",
	"IT & Software",
	"Office Productivity",
	"Personal Development",
	"Design",
	"Health & Fitness",
	"Music",
	"Teaching & Academics",
] as const;

const minLengthError = (field: string, length: number) =>
	`${field} must be at least ${length} characters long`;

const courseIdError = "Invalid courseId";
const chapterIdError = "Invalid chapter id";

export const courseSchema = z.object({
	title: z
		.string()
		.min(3, { error: minLengthError("Title", 3) })
		.max(100, { error: "Title must be at most 100 characters" }),
	description: z.string().min(3, { error: minLengthError("Description", 3) }),
	fileKey: z.string().min(1, { error: "File is required" }),
	price: z.coerce.number().min(1, { error: "Price must be a positive number" }),
	duration: z.coerce
		.number()
		.min(1, { error: "Duration must be at least 1 hour" })
		.max(500, { error: "Duration must be at most 500 hours" }),
	level: z.enum(courseLevels),
	category: z.enum(CourseCategories, { error: "Category is required" }),
	smallDescription: z
		.string()
		.min(3, { error: minLengthError("Small description", 3) })
		.max(200, {
			error: "Small description must be at most 200 characters long",
		}),
	slug: z
		.string()
		.min(3, { error: minLengthError("Slug", 3) })
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, {
			error: "Slug must contain only lowercase letters, numbers, and hyphens",
		}),
	status: z.enum(courseStatus),
});
export type CourseInput = z.input<typeof courseSchema>;

export const courseIdSchema = z.object({
	id: z.uuid({ error: courseIdError }),
});
export type CourseId = z.input<typeof courseIdSchema>;

export const getCoursesQuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(100).default(50),
	offset: z.coerce.number().int().min(0).default(0),
	status: z.enum(courseStatus).optional(),
});
export type GetCoursesQuery = z.input<typeof getCoursesQuerySchema>;

export const updateCourseSchema = courseSchema
	.partial()
	.extend({ id: z.uuid({ error: courseIdError }) })
	.refine((value) => Object.keys(value).length > 1, {
		error: "Provide at least one field to update",
	});
export type UpdateCourseInput = z.input<typeof updateCourseSchema>;

export const reorderLessonSchema = z.object({
	chapterId: z.uuid({ error: chapterIdError }),
	courseId: z.uuid({ error: courseIdError }),
	lessonArray: z
		// Min can't be 0 since we reorder everything to begin indexing from 1
		.array(z.object({ id: z.uuid(), position: z.number().int().min(1) }))
		.min(1, { error: "Provide at least one lesson to reorder" }),
});
export type ReorderLessonInput = z.input<typeof reorderLessonSchema>;

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

export const chapterSchema = z.object({
	name: z.string().min(3, "Name must be at least 3 characters long"),
	courseId: z.uuid({ error: courseIdError }),
});
export type ChapterInput = z.input<typeof chapterSchema>;

export const lessonSchema = z.object({
	name: z.string().min(3, "Name must be at least 3 characters long"),
	courseId: z.uuid({ error: courseIdError }),
	chapterId: z.uuid({ error: chapterIdError }),
	description: z
		.string()
		.min(3, "Description must be at least 3 characters long")
		.optional(),
	thumbnailKey: z.string().optional(),
	videoKey: z.string().optional(),
});
export type LessonInput = z.input<typeof lessonSchema>;

export const deleteLessonSchema = z.object({
	courseId: z.uuid({ error: courseIdError }),
	chapterId: z.uuid({ error: chapterIdError }),
	lessonId: z.uuid({ error: "Invalid lesson id" }),
});
export type DeleteLessonInput = z.input<typeof deleteLessonSchema>;
