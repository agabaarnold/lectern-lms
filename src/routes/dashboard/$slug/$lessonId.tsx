// oxlint-disable react/function-component-definition func-style
import { Await, createFileRoute } from "@tanstack/react-router";

import { getLessonContent } from "#/features/courses/functions/lessons.ts";

import { CourseContent } from "./-components/course-content";
import { CourseContentSkeleton } from "./-components/course-content-skeleton";

export const Route = createFileRoute("/dashboard/$slug/$lessonId")({
	loader: ({ params }) => ({
		lesson: getLessonContent({ data: { id: params.lessonId } }),
	}),
	component: LessonPage,
});

function LessonPage() {
	const { lesson } = Route.useLoaderData();

	return (
		<Await fallback={<CourseContentSkeleton />} promise={lesson}>
			{({ lesson: resolvedLesson }) => (
				<CourseContent lesson={resolvedLesson} />
			)}
		</Await>
	);
}
