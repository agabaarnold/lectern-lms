import { createServerFn } from "@tanstack/react-start";

import { db } from "#/db/index.ts";
import { courses } from "#/db/schema/lms.schema.ts";
import { adminMiddleware } from "#/middleware.ts";

import { courseIdSchema, courseSchema, dbErrorSchema } from "../schema";

export const createCourse = createServerFn({ method: "POST" })
	.middleware([adminMiddleware])
	.validator(courseSchema)
	.handler(async ({ context, data }) => {
		const userId = context.user.id;

		try {
			const [course] = await db
				.insert(courses)
				.values({ ...data, userId })
				.returning();

			if (!course) {
				throw new Error("Failed to create course");
			}

			return course;
		} catch (error) {
			const parsedError = dbErrorSchema.safeParse(error);

			if (parsedError.success && parsedError.data.code === "23505") {
				throw new Error("A course with this slug already exists", {
					cause: error,
				});
			}

			throw new Error("Failed to create course", { cause: error });
		}
	});

export const getCourses = createServerFn({ method: "GET" })
	.middleware([adminMiddleware])
	.handler(async () => {
		const data = await db.query.courses.findMany({
			orderBy: { createdAt: "desc" },
		});

		return data;
	});

export const getCourse = createServerFn({ method: "GET" })
	.middleware([adminMiddleware])
	.validator(courseIdSchema)
	.handler(async ({ data }) => {
		const courseId = data.id;

		const course = await db.query.courses.findMany({ where: { id: courseId } });

		return course;
	});
