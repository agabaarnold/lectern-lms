// oxlint-disable react/function-component-definition func-style
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/$slug/")({
	component: CourseSlugRoute,
});

function CourseSlugRoute() {
	return <div>Hello "/dashboard/$slug/"!</div>;
}
