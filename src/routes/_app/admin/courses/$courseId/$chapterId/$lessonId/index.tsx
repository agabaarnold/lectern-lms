// oxlint-disable react/function-component-definition func-style
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/_app/admin/courses/$courseId/$chapterId/$lessonId/"
)({
	component: LessonPage,
});

function LessonPage() {
	return (
		<div>Hello "/_app/admin/courses/$courseId/$chapterId/$lessonId/"!</div>
	);
}
