// oxlint-disable react/function-component-definition func-style
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/admin/courses/$courseId/")({
	beforeLoad: ({ params }) => {
		throw redirect({
			to: "/admin/courses/$courseId/edit",
			params: { courseId: params.courseId },
		});
	},
});
