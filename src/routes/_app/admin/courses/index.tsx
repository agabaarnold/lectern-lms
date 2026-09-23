import { createFileRoute, Link } from "@tanstack/react-router";

// oxlint-disable func-style
// oxlint-disable react/function-component-definition
import { buttonVariants } from "#/components/ui/button.tsx";
import { getCourses } from "#/features/courses/functions/courses.ts";

import { AdminCourseCard } from "./-components/admin-course-card";

export const Route = createFileRoute("/_app/admin/courses/")({
	loader: () => getCourses(),
	component: CoursesPage,
});

function CoursesPage() {
	const courses = Route.useLoaderData();

	return (
		<>
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Your Courses</h1>

				<Link className={buttonVariants()} to="/admin/courses/create">
					Create Course
				</Link>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
				{courses.map((course) => (
					<AdminCourseCard course={course} key={course.id} />
				))}
			</div>
		</>
	);
}
