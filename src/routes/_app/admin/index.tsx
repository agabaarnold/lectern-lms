// oxlint-disable react/function-component-definition func-style
import { Await, createFileRoute, Link } from "@tanstack/react-router";

import { ChartAreaInteractive } from "#/components/sidebar/chart-area-interactive.tsx";
import { SectionCards } from "#/components/sidebar/section-cards.tsx";
import { buttonVariants } from "#/components/ui/button.tsx";
import {
	getDashboardOverview,
	getRecentCourses,
} from "#/features/admin/functions/index.ts";

import { AdminCourseCard } from "./courses/-components/admin-course-card";
import { CoursesLoadingGrid } from "./courses/-components/courses-loading-grid";
import { EmptyCourses } from "./courses/-components/empty-courses";

export const Route = createFileRoute("/_app/admin/")({
	loader: async () => {
		const overview = await getDashboardOverview();
		const recentCourses = getRecentCourses();

		return { overview, recentCourses };
	},
	component: AdminDashboard,
});

function AdminDashboard() {
	const { overview, recentCourses } = Route.useLoaderData();

	const { totalCourses, totalCustomers, totalLessons, totalSignups } =
		overview.stats;

	return (
		<>
			<SectionCards
				totalCourses={totalCourses}
				totalCustomers={totalCustomers}
				totalLessons={totalLessons}
				totalSignups={totalSignups}
			/>

			<ChartAreaInteractive data={overview.enrollmentChart} />

			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold">Recent Courses</h2>

					<Link
						to="/admin/courses"
						className={buttonVariants({ variant: "outline" })}
					>
						View All Course
					</Link>
				</div>

				<Await promise={recentCourses} fallback={<CoursesLoadingGrid />}>
					{(resolvedCourses) =>
						resolvedCourses.length === 0 ? (
							<EmptyCourses />
						) : (
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								{resolvedCourses.map((course) => (
									<AdminCourseCard key={course.id} course={course} />
								))}
							</div>
						)
					}
				</Await>
			</div>
		</>
	);
}
