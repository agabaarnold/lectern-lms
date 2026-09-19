import { createFileRoute, Link } from "@tanstack/react-router";

// oxlint-disable func-style
// oxlint-disable react/function-component-definition
import { buttonVariants } from "#/components/ui/button.tsx";

export const Route = createFileRoute("/_app/admin/courses/")({
	component: CoursesPage,
});

function CoursesPage() {
	return (
		<>
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Your Courses</h1>

				<Link className={buttonVariants()} to="/admin/courses/create">
					Create Course
				</Link>
			</div>

			<div>
				<h1>Here you will see all the courses</h1>
			</div>
		</>
	);
}
