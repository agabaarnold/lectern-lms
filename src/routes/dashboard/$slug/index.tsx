// oxlint-disable react/function-component-definition func-style
import { createFileRoute, redirect } from "@tanstack/react-router";

import { getCourseSiderbarData } from "#/features/courses/functions/courses.ts";

export const Route = createFileRoute("/dashboard/$slug/")({
	loader: async ({ params }) => {
		const data = await getCourseSiderbarData({
			data: { slug: params.slug },
		});

		const firstLesson = data.course.chapters[0]?.lessons[0];

		if (firstLesson) {
			throw redirect({
				to: "/dashboard/$slug/$lessonId",
				params: { slug: params.slug, lessonId: firstLesson.id },
			});
		}

		return data;
	},
	component: CourseSlugRoute,
});

function CourseSlugRoute() {
	return (
		<div className="flex items-center justify-center">
			<h2 className="mb-2 text-2xl font-bold">No lessons available</h2>

			<p>This course does not have any lessons yet</p>
		</div>
	);
}
