import { createFileRoute } from "@tanstack/react-router";

// oxlint-disable react/function-component-definition func-style
import { getAllCourses } from "#/features/courses/functions/courses.ts";
import { getEnrolledCourses } from "#/features/courses/functions/enrollments.ts";

import { CoursesEmptyState } from "./-components/courses-empty-state";

export const Route = createFileRoute("/dashboard/")({
	loader: async () => {
		const [allCourses, enrolledCourses] = await Promise.all([
			getAllCourses(),
			getEnrolledCourses(),
		]);

		return { allCourses, enrolledCourses };
	},
	component: DashboardPage,
});

function DashboardPage() {
	const { allCourses, enrolledCourses } = Route.useLoaderData();

	return (
		<>
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold">Enrolled Courses</h1>

				<p className="text-muted-foreground">
					Here you can see all the courses you have access to.
				</p>
			</div>

			{enrolledCourses.length === 0 ? (
				<CoursesEmptyState
					buttonText="Browse courses"
					description="You haven't enrolled in any courses yet. Browse the catalog to find something to learn."
					href="/courses"
					title="No enrolled courses yet"
				/>
			) : (
				<p>The courses you are enrolled in</p>
			)}

			<section className="mt-10">
				<div className="flex flex-col gap-2">
					<h1 className="text-3xl font-bold">Available Courses</h1>

					<p className="text-muted-foreground">
						Here you can see all the courses you can purchase.
					</p>
				</div>

				{allCourses.filter(
					(course) =>
						!enrolledCourses.some((enrolled) => enrolled.id === course.id)
				).length === 0 ? (
					<CoursesEmptyState
						buttonText="Browse courses"
						description="You have purchased every available course. Check back later for new releases."
						href="/courses"
						title="You've purchased all courses"
					/>
				) : (
					<p>More courses</p>
				)}
			</section>
		</>
	);
}
