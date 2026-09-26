// oxlint-disable shadcn/no-raw-colors
import { IconCircleCheck } from "@tabler/icons-react";

import { RenderDescription } from "#/components/rich-text/render-description.tsx";
import { Button } from "#/components/ui/button.tsx";
import type { getLessonContent } from "#/features/courses/functions/lessons.ts";

import { VideoPlayer } from "./video-player";

interface CourseContentProps {
	lesson: Awaited<ReturnType<typeof getLessonContent>>["lesson"];
}

export const CourseContent = ({ lesson }: CourseContentProps) => (
	<div className="bg-background flex h-full flex-col pl-6">
		<VideoPlayer
			thumbnailKey={lesson.thumbnailKey ?? ""}
			videoKey={lesson.videoKey ?? ""}
		/>

		<div className="border-b py-4">
			<Button variant="outline">
				<IconCircleCheck className="mr-2 size-4 text-green-500" /> Mark as
				complete
			</Button>
		</div>

		<div className="space-y-3 pt-3">
			<h1 className="text-foreground text-3xl font-bold tracking-tight">
				{lesson.title}
			</h1>

			{lesson.description && (
				<RenderDescription json={JSON.parse(lesson.description)} />
			)}
		</div>
	</div>
);
