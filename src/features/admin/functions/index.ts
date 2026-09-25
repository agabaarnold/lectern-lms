import { createServerFn } from "@tanstack/react-start";
import { and, eq, exists } from "drizzle-orm";

import { db } from "#/db/index.ts";
import { users } from "#/db/schema/auth.schema.ts";
import { courses, enrollments, lessons } from "#/db/schema/lms.schema.ts";
import { adminMiddleware } from "#/middleware.ts";

export const getDashboardStats = createServerFn()
	.middleware([adminMiddleware])
	.handler(async () => {
		const [totalSignups, totalCustomers, totalCourses, totalLessons] =
			await Promise.all([
				// total signups
				db.$count(users),

				// total customers
				db.$count(
					users,
					exists(
						db
							.select()
							.from(enrollments)
							.where(
								and(
									eq(enrollments.userId, users.id),
									eq(enrollments.status, "Active")
								)
							)
					)
				),

				// total courses
				db.$count(courses),

				//total lessons
				db.$count(lessons),
			]);

		return { totalSignups, totalCustomers, totalCourses, totalLessons };
	});
