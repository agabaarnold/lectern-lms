import { useNavigate } from "@tanstack/react-router";
import { useTransition } from "react";
import { toast } from "react-hot-toast";

import { Button } from "#/components/ui/button.tsx";
import { Spinner } from "#/components/ui/spinner.tsx";
import { enrollInCourse } from "#/features/courses/functions/enrollments.ts";
import { tryCatch } from "#/lib/try-catch.ts";

export const EnrollmentButton = ({ courseId }: { courseId: string }) => {
	const navigate = useNavigate();
	const [isPending, startTransition] = useTransition();

	const onSubmit = () => {
		startTransition(async () => {
			const { data, error } = await tryCatch(
				enrollInCourse({ data: { courseId } })
			);

			if (error) {
				toast.error(
					error.message ?? "An unexpected error occurred. Please try again"
				);
				return;
			}

			if (!data.data.checkoutUrl) {
				toast.error("Could not start checkout. Please try again.");
				return;
			}

			navigate({ href: data.data.checkoutUrl });
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
