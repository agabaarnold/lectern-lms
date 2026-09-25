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

export const getEnrollmentStats = createServerFn()
	.middleware([adminMiddleware])
	.handler(async () => {
		const thirtyDaysAgo = new Date();

		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const enrollmentsData = await db.query.enrollments.findMany({
			where: {
				createdAt: {
					gte: thirtyDaysAgo,
				},
			},
			columns: { createdAt: true },
			orderBy: { createdAt: "desc" },
		});

		const last30Days: { date: string; enrollments: number }[] = [];

		for (let i = 29; i >= 0; i -= 1) {
			const date = new Date();

			date.setDate(date.getDate() - i);

			last30Days.push({
				date: date.toISOString().split("T")[0],
				enrollments: 0,
			});
		}

		for (const { createdAt } of enrollmentsData) {
			const [enrollmentDate] = createdAt.toISOString().split("T");
			const dayIndex = last30Days.findIndex(
				(day) => day.date === enrollmentDate
			);

			if (dayIndex !== -1) {
				last30Days[dayIndex].enrollments += 1;
			}
		}

		return last30Days;
	});

export const getRecentCourses = createServerFn()
	.middleware([adminMiddleware])
	.handler(
		async () =>
			await db.query.courses.findMany({
				orderBy: { createdAt: "desc" },
				limit: 2,
			})
	);
