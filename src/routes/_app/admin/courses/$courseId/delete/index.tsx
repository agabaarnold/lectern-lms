// oxlint-disable react/function-component-definition func-style
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useTransition } from "react";
import { toast } from "react-hot-toast";

import { Button, buttonVariants } from "#/components/ui/button.tsx";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";
import { Spinner } from "#/components/ui/spinner.tsx";
import { deleteCourse } from "#/features/courses/functions/courses.ts";
import { tryCatch } from "#/lib/try-catch.ts";

export const Route = createFileRoute("/_app/admin/courses/$courseId/delete/")({
	component: DeleteCoursePage,
});

function DeleteCoursePage() {
	const router = useRouter();
	const { courseId } = Route.useParams();
	const [isPending, startTransition] = useTransition();

	const onSubmit = () => {
		startTransition(async () => {
			const { error } = await tryCatch(
				deleteCourse({ data: { id: courseId } })
			);
			if (error) {
				toast.error(
					error.message ?? "An unexpected error occurred. Please try again"
				);
				return;
			}

			toast.success("Course deleted successfully");
			router.navigate({ to: "/admin/courses", replace: true });
		});
	};

	return (
		<div className="mx-auto w-full max-w-xl">
			<Card className="mt-32">
				<CardHeader>
					<CardTitle>Are you sure you want to delete this course?</CardTitle>
					<CardDescription>This action cannot be undone.</CardDescription>
				</CardHeader>

				<CardContent className="flex items-center justify-between">
					<Link
						className={buttonVariants({ variant: "outline" })}
						to="/admin/courses"
					>
						Cancel
					</Link>

					<Button disabled={isPending} onClick={onSubmit} variant="destructive">
						{isPending ? (
							<>
								<Spinner /> Deleting...
							</>
						) : (
							"Delete"
						)}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
