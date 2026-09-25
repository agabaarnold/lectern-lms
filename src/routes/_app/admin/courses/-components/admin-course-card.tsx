// oxlint-disable shadcn/no-restyle
import {
	IconArrowRight,
	IconDotsVertical,
	IconEdit,
	IconEye,
	IconSchool,
	IconStopwatch,
	IconTrash,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

import { Image } from "#/components/shared/image.tsx";
import { Button, buttonVariants } from "#/components/ui/button.tsx";
import { Card, CardContent } from "#/components/ui/card.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu.tsx";
import type { getRecentCourses } from "#/features/admin/functions/index.ts";
import { urlConstruct } from "#/lib/url-construct.ts";

interface AdminCourseCardProps {
	course: Awaited<ReturnType<typeof getRecentCourses>>[number];
}

export const AdminCourseCard = ({ course }: AdminCourseCardProps) => {
	const thumbnailUrl = urlConstruct(course.fileKey);

	return (
		<Card className="group relative gap-0 py-0">
			{/* Absolute dropdown */}
			<div className="absolute top-2 right-2 z-10">
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button variant="secondary" size="icon">
								<IconDotsVertical className="size-4" />
							</Button>
						}
					/>

					<DropdownMenuContent className="w-48" align="end">
						<DropdownMenuItem
							render={
								<Link
									to="/admin/courses/$courseId/edit"
									params={{ courseId: course.id }}
								>
									<IconEdit className="mr-2 size-4" /> Edit Course
								</Link>
							}
						/>

						<DropdownMenuItem
							render={
								<Link to="/courses/$slug" params={{ slug: course.slug }}>
									<IconEye className="mr-2 size-4" /> Preview
								</Link>
							}
						/>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							variant="destructive"
							render={
								<Link
									to="/admin/courses/$courseId/delete"
									params={{ courseId: course.id }}
								>
									<IconTrash className="text-destructive mr-2 size-4" /> Delete
									Course
								</Link>
							}
						/>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<Image
				className="aspect-video h-full w-full rounded-t-lg object-cover"
				width={600}
				height={400}
				src={thumbnailUrl}
				alt={course.title}
			/>

			<CardContent className="p-4">
				<Link
					className="group-hover:text-primary line-clamp-2 text-lg font-medium transition-colors hover:underline"
					to="/admin/courses/$courseId"
					params={{ courseId: course.id }}
				>
					{course.title}
				</Link>

				<p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-tight">
					{course.smallDescription}
				</p>

				<div className="mt-4 flex items-center gap-x-5">
					<div className="flex items-center gap-x-2">
						<IconStopwatch className="text-primary bg-primary/10 size-6 rounded-md p-1" />
						<span className="text-muted-foreground text-sm">
							{course.duration}h
						</span>
					</div>

					<div className="flex items-center gap-x-2">
						<IconSchool className="text-primary bg-primary/10 size-6 rounded-md p-1" />
						<span className="text-muted-foreground text-sm">
							{course.level}
						</span>
					</div>
				</div>

				<Link
					className={buttonVariants({ className: "w-full mt-4" })}
					to="/admin/courses/$courseId/edit"
					params={{ courseId: course.id }}
				>
					Edit Course <IconArrowRight className="size-4" />
				</Link>
			</CardContent>
		</Card>
	);
};
