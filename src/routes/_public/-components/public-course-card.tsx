import { IconSchool, IconStopwatch } from "@tabler/icons-react";
// oxlint-disable shadcn/no-restyle
import { Link } from "@tanstack/react-router";

import { Image } from "#/components/shared/image.tsx";
import { Badge } from "#/components/ui/badge.tsx";
import { buttonVariants } from "#/components/ui/button.tsx";
import { Card, CardContent } from "#/components/ui/card.tsx";
import type { getAllCourses } from "#/features/courses/functions/courses.ts";
import { urlConstruct } from "#/lib/url-construct.ts";

interface PublicCourseCardProps {
	course: Awaited<ReturnType<typeof getAllCourses>>[0];
}

export const PublicCourseCard = ({ course }: PublicCourseCardProps) => {
	const thumbnailUrl = urlConstruct(course.fileKey);

	return (
		<Card className="group relative gap-0 py-0">
			<Badge className="absolute top-2 right-2 z-10">{course.level}</Badge>

			<Image
				className="h-full w-full rounded-t-xl object-cover"
				width={600}
				height={400}
				src={thumbnailUrl}
				alt={`${course.title} course`}
			/>

			<CardContent className="p-4">
				<Link
					className="group-hover:text-primary line-clamp-2 text-lg font-medium transition-colors hover:underline"
					to="/courses/$slug"
					params={{ slug: course.slug }}
				>
					{course.title}
				</Link>

				<p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-tight">
					{course.smallDescription}
				</p>

				<div className="mt-4 flex items-center gap-x-5">
					<div className="flex items-center gap-x-2">
						<IconStopwatch className="text-primary bg-primary/10 size-6 rounded-md p-1" />
						<p className="text-muted-foreground text-sm">{course.duration}h</p>
					</div>

					<div className="flex items-center gap-x-2">
						<IconSchool className="text-primary bg-primary/10 size-6 rounded-md p-1" />
						<p className="text-muted-foreground text-sm">{course.category}</p>
					</div>
				</div>

				<Link
					className={buttonVariants({ className: "w-full mt-4" })}
					to="/courses/$slug"
					params={{ slug: course.slug }}
				>
					Learn more
				</Link>
			</CardContent>
		</Card>
	);
};
