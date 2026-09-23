import { IconTrash } from "@tabler/icons-react";
import { useRouter } from "@tanstack/react-router";
import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "#/components/ui/alert-dialog.tsx";
import { Button } from "#/components/ui/button.tsx";
import { Spinner } from "#/components/ui/spinner.tsx";
import { deleteChapter } from "#/features/courses/functions/index.ts";
import { tryCatch } from "#/lib/try-catch.ts";

export const DeleteChapter = ({
	courseId,
	chapterId,
}: {
	courseId: string;
	chapterId: string;
}) => {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const handleSubmit = () => {
		startTransition(async () => {
			const { error } = await tryCatch(
				deleteChapter({ data: { courseId, chapterId } })
			);

			if (error) {
				toast.error(
					error.message ?? "An unexpected error occurred. Please try again"
				);
				return;
			}

			toast.success("Chapter deleted successfully");
			setOpen(false);
			await router.invalidate();
		});
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger
				render={
					<Button className="" variant="ghost">
						<IconTrash className="size-4" />
					</Button>
				}
			/>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete this
						chapter and all of its lessons
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction disabled={isPending} onClick={handleSubmit}>
						{isPending ? (
							<>
								<Spinner /> Deleting...
							</>
						) : (
							"Delete"
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
