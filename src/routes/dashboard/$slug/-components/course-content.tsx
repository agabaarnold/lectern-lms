// oxlint-disable shadcn/no-raw-colors shadcn/no-restyle
import { IconCircleCheck } from "@tabler/icons-react";
import { useRouter } from "@tanstack/react-router";
import { useTransition } from "react";
import { toast } from "react-hot-toast";

import { RenderDescription } from "#/components/rich-text/render-description.tsx";
import { Button } from "#/components/ui/button.tsx";
import { markLessonComplete } from "#/features/courses/functions/lessons.ts";
import type { getLessonContent } from "#/features/courses/functions/lessons.ts";
import { parseTiptapDocument } from "#/features/courses/schema/tiptap.ts";
import { useConfetti } from "#/hooks/use-confetti.ts";
import { tryCatch } from "#/lib/try-catch.ts";

import { VideoPlayer } from "./video-player";

interface CourseContentProps {
	lesson: Awaited<ReturnType<typeof getLessonContent>>["lesson"];
}

export const CourseContent = ({ lesson }: CourseContentProps) => {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const { triggerConfetti } = useConfetti();

	const onSubmit = () => {
		startTransition(async () => {
			const { error } = await tryCatch(
				markLessonComplete({ data: { id: lesson.id } })
			);

			if (error) {
				toast.error(
					error.message ?? "An unexpected error occurred. Please try again"
				);
				return;
			}

			toast.success("Progress updated");
			triggerConfetti();

			router.invalidate();
		});
	};

	return (
		<div className="bg-background flex h-full flex-col pl-6">
			<VideoPlayer
				thumbnailKey={lesson.thumbnailKey ?? ""}
				videoKey={lesson.videoKey ?? ""}
			/>

			<div className="border-b py-4">
				{lesson.lessonProgress.length === 0 ? (
					<Button disabled={isPending} onClick={onSubmit} variant="outline">
						<IconCircleCheck className="mr-2 size-4 text-green-500" /> Mark as
						complete
					</Button>
				) : (
					<Button className="bg-green-500/10 text-green-500" variant="outline">
						<IconCircleCheck className="mr-2 size-4 text-green-500" /> Completed
					</Button>
				)}
			</div>

			<div className="space-y-3 pt-3">
				<h1 className="text-foreground text-3xl font-bold tracking-tight">
					{lesson.title}
				</h1>

				{lesson.description && (
					<RenderDescription json={parseTiptapDocument(lesson.description)} />
				)}
			</div>
		</div>
	);
};
