// oxlint-disable react/function-component-definition func-style
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { getCourseSiderbarData } from "#/features/courses/functions/courses.ts";

import { CourseSidebar } from "./-components/course-sidebar";

export const Route = createFileRoute("/dashboard/$slug")({
	loader: async ({ params }) => {
		const { course } = await getCourseSiderbarData({
			data: { slug: params.slug },
		});

		return { course };
	},
	component: CourseLayout,
});

function CourseLayout() {
	const { course } = Route.useLoaderData();

	return (
		<div className="flex flex-1">
			{/* Sidebar - 30% */}
			<div className="border-border w-80 shrink-0 border-r">
				<CourseSidebar course={course} />
			</div>

			{/* Main Content - 70% */}
			<div className="flex-1 overflow-hidden">
				<Outlet />
			</div>
		</div>
	);
}
