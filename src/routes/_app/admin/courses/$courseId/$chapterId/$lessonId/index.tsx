import { createFileRoute } from "@tanstack/react-router";

// oxlint-disable react/function-component-definition func-style
import { getLesson } from "#/features/courses/functions/lessons.ts";

import { LessonForm } from "./-components/lesson-form";

export const Route = createFileRoute(
	"/_app/admin/courses/$courseId/$chapterId/$lessonId/"
)({
	loader: async ({ params }) => {
		const { lessonId } = params;

		const lesson = await getLesson({ data: { id: lessonId } });

		return { lesson };
	},
	component: LessonPage,
});

function LessonPage() {
	const { lesson } = Route.useLoaderData();
	const { chapterId, courseId } = Route.useParams();

	return (
		<LessonForm lesson={lesson} chapterId={chapterId} courseId={courseId} />
	);
}
