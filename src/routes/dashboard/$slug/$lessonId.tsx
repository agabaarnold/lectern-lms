// oxlint-disable react/function-component-definition func-style
import { createFileRoute } from "@tanstack/react-router";

import { getLessonContent } from "#/features/courses/functions/lessons.ts";

export const Route = createFileRoute("/dashboard/$slug/$lessonId")({
	loader: async ({ params }) => {
		const { lesson } = await getLessonContent({
			data: { id: params.lessonId },
		});

		return { lesson };
	},
	component: LessonPage,
});

function LessonPage() {
	const { lesson } = Route.useLoaderData();

	return <div>Hello "/dashboard/$slug/$lessonId"!</div>;
}
