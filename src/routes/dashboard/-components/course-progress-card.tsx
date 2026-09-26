// oxlint-disable shadcn/no-restyle
import { Link } from "@tanstack/react-router";

import { Image } from "#/components/shared/image.tsx";
import { Badge } from "#/components/ui/badge.tsx";
import { buttonVariants } from "#/components/ui/button.tsx";
import { Card, CardContent } from "#/components/ui/card.tsx";
import { Progress } from "#/components/ui/progress.tsx";
import type { getEnrolledCourses } from "#/features/courses/functions/enrollments.ts";
import { useCourseProgress } from "#/hooks/use-course-progress.ts";
import { urlConstruct } from "#/lib/url-construct.ts";

interface CourseProgressCardProps {
	courses: Awaited<ReturnType<typeof getEnrolledCourses>>[0];
}

export const CourseProgressCard = ({ courses }: CourseProgressCardProps) => {
	const thumbnailUrl = urlConstruct(courses.course.fileKey);

	const { completedLessons, progressPercentage, totalLessons } =
		// oxlint-disable-next-line typescript/no-explicit-any anti-slop/require-safety-comment-for-type-assertion
		useCourseProgress({ course: courses.course as any });

	return (
		<Card className="group relative gap-0 py-0">
			<Badge className="absolute top-2 right-2 z-10">
				{courses.course.level}
			</Badge>

			<Image
				className="h-full w-full rounded-t-xl object-cover"
				width={600}
				height={400}
				src={thumbnailUrl}
				alt={`${courses.course.title} course`}
			/>

			<CardContent className="p-4">
				<Link
					className="group-hover:text-primary line-clamp-2 text-lg font-medium transition-colors hover:underline"
					to="/dashboard/$slug"
					params={{ slug: courses.course.slug }}
				>
					{courses.course.title}
				</Link>

				<p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-tight">
					{courses.course.smallDescription}
				</p>

				<div className="space-y-4 mt-5">
					<div className="mb-1 flex justify-between text-sm">
						<p>Progress:</p>
						<p className="font-medium">{progressPercentage} %</p>
					</div>

					<Progress value={progressPercentage} className="h-1.5" />

					<p className="text-xs text-muted-foreground mt-1">
						{completedLessons} of {totalLessons} lessons completed.
					</p>
				</div>

				<Link
					className={buttonVariants({ className: "w-full mt-4" })}
					to="/dashboard/$slug"
					params={{ slug: courses.course.slug }}
				>
					Learn more
				</Link>
			</CardContent>
		</Card>
	);
};
