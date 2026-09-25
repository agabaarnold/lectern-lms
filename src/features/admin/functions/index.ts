import { createServerFn } from "@tanstack/react-start";
import { and, eq, exists } from "drizzle-orm";

import { db } from "#/db/index.ts";
import { users } from "#/db/schema/auth.schema.ts";
import { courses, enrollments, lessons } from "#/db/schema/lms.schema.ts";
import { adminMiddleware } from "#/middleware.ts";

const buildLast30Days = (now: Date) => {
	const days: { date: string; enrollments: number }[] = [];

	for (let i = 29; i >= 0; i -= 1) {
		const date = new Date(now);

		date.setDate(now.getDate() - i);

		const [day] = date.toISOString().split("T");

		days.push({ date: day ?? "", enrollments: 0 });
	}

	return days;
};

export const getDashboardOverview = createServerFn()
	.middleware([adminMiddleware])
	.handler(async () => {
		const thirtyDaysAgo = new Date();

		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const [
			totalSignups,
			totalCustomers,
			totalCourses,
			totalLessons,
			enrollmentRows,
		] = await Promise.all([
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

			// total lessons
			db.$count(lessons),

			// enrollment rows for the 30-day chart
			db.query.enrollments.findMany({
				where: {
					createdAt: {
						gte: thirtyDaysAgo,
					},
				},
				columns: { createdAt: true },
				orderBy: { createdAt: "desc" },
			}),
		]);

		const enrollmentChart = buildLast30Days(new Date());
		const byDate = new Map(enrollmentChart.map((day) => [day.date, day]));

		for (const { createdAt } of enrollmentRows) {
			const [day] = createdAt.toISOString().split("T");
			const entry = day === undefined ? undefined : byDate.get(day);

			if (entry) {
				entry.enrollments += 1;
			}
		}

		return {
			stats: { totalSignups, totalCustomers, totalCourses, totalLessons },
			enrollmentChart,
		};
	});

export const getRecentCourses = createServerFn()
	.middleware([adminMiddleware])
	.handler(
		async () =>
			await db.query.courses.findMany({
				orderBy: { createdAt: "desc" },
				limit: 2,
				columns: {
					id: true,
					title: true,
					smallDescription: true,
					duration: true,
					level: true,
					fileKey: true,
					slug: true,
				},
			})
	);
