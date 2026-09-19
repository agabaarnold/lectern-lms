import { z } from "zod";

export const courseLevels = ["Beginner", "Intermediate", "Advanced"] as const;
export const courseStatus = ["Draft", "Published", "Archived"] as const;

const minLengthError = (field: string, length: number) =>
	`${field} must be at least ${length} characters long`;

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
	category: z.string(),
	smallDescription: z
		.string()
		.min(3, { error: minLengthError("Small description", 3) })
		.max(200, {
			error: "Small description must be at most 200 characters long",
		}),
	slug: z.string().min(3, { error: minLengthError("Slug", 3) }),
	status: z.enum(courseStatus),
});
export type CourseInput = z.input<typeof courseSchema>;
