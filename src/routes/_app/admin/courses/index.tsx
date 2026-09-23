import { Await, createFileRoute, Link } from "@tanstack/react-router";

// oxlint-disable react/function-component-definition func-style
import { buttonVariants } from "#/components/ui/button.tsx";
import { getCourses } from "#/features/courses/functions/courses.ts";

import { AdminCourseCard } from "./-components/admin-course-card";
import { CoursesLoadingGrid } from "./-components/courses-loading-grid";
import { EmptyCourses } from "./-components/empty-courses";

export const Route = createFileRoute("/_app/admin/courses/")({
	loader: () => ({ courses: getCourses() }),
	component: CoursesPage,
});

function CoursesPage() {
	const { courses } = Route.useLoaderData();

	return (
		<>
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Your Courses</h1>

				<Link className={buttonVariants()} to="/admin/courses/create">
					Create Course
				</Link>
			</div>

			<Await promise={courses} fallback={<CoursesLoadingGrid />}>
				{(resolvedCourses) =>
					resolvedCourses.length === 0 ? (
						<EmptyCourses />
					) : (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
							{resolvedCourses.map((course) => (
								<AdminCourseCard course={course} key={course.id} />
							))}
						</div>
					)
				}
			</Await>
		</>
	);
}
