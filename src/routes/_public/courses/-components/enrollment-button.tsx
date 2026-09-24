import { useTransition } from "react";
import { toast } from "react-hot-toast";

import { Button } from "#/components/ui/button.tsx";
import { Spinner } from "#/components/ui/spinner.tsx";
import { enrollInCourse } from "#/features/courses/functions/enrollments.ts";
import { tryCatch } from "#/lib/try-catch.ts";

export const EnrollmentButton = ({ courseId }: { courseId: string }) => {
	const [isPending, startTransition] = useTransition();

	const onSubmit = () => {
		startTransition(async () => {
			const { error } = await tryCatch(enrollInCourse({ data: { courseId } }));

			if (error) {
				toast.error(
					error.message ?? "An unexpected error occurred. Please try again"
				);
				return;
			}

			toast.success("Course created successfully");
		});
	};

	return (
		<Button disabled={isPending} onClick={onSubmit} className="w-full">
			{isPending ? (
				<>
					<Spinner /> Loading...
				</>
			) : (
				"Enroll Now"
			)}
		</Button>
	);
};
