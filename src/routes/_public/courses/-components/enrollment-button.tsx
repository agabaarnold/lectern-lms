import { useNavigate } from "@tanstack/react-router";
import { useTransition } from "react";
import { toast } from "react-hot-toast";

import { Button } from "#/components/ui/button.tsx";
import { Spinner } from "#/components/ui/spinner.tsx";
import { enrollInCourse } from "#/features/courses/functions/enrollments.ts";
import { authClient } from "#/lib/auth-client.ts";
import { tryCatch } from "#/lib/try-catch.ts";

export const EnrollmentButton = ({
	courseId,
	slug,
}: {
	courseId: string;
	slug: string;
}) => {
	const navigate = useNavigate();
	const [isPending, startTransition] = useTransition();
	const { data: session, isPending: isSessionPending } =
		authClient.useSession();

	const onSubmit = () => {
		// Anonymous users never reach the server function (its auth
		// redirect would be swallowed into a toast). Send them to login
		// with the course as the post-login return URL instead.
		if (!isSessionPending && !session) {
			navigate({
				to: "/login",
				search: { redirect: `/courses/${slug}` },
			});
			return;
		}

		startTransition(async () => {
			const { data, error } = await tryCatch(
				enrollInCourse({ data: { courseId } })
			);

			if (error) {
				console.error("Failed to start enrollment checkout", error);
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
		<Button
			disabled={isPending || isSessionPending}
			onClick={onSubmit}
			className="w-full"
		>
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
