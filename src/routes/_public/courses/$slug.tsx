// oxlint-disable shadcn/no-restyle
import { IconCategory, IconChartBar, IconClock } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

import { RenderDescription } from "#/components/rich-text/render-description.tsx";
// oxlint-disable react/function-component-definition func-style
import { Image } from "#/components/shared/image.tsx";
import { Badge } from "#/components/ui/badge.tsx";
import { Card, CardContent } from "#/components/ui/card.tsx";
import {
	Collapsible,
	CollapsibleTrigger,
} from "#/components/ui/collapsible.tsx";
import { Separator } from "#/components/ui/separator.tsx";
import { getIndividualCourse } from "#/features/courses/functions/courses.ts";
import { urlConstruct } from "#/lib/url-construct.ts";

export const Route = createFileRoute("/_public/courses/$slug")({
	loader: async ({ params }) => {
		const { slug } = params;
		const course = await getIndividualCourse({ data: { slug } });

		return { course };
	},
	component: SlugPage,
});

function SlugPage() {
	const { course } = Route.useLoaderData();

	const thumbnailUrl = urlConstruct(course.fileKey);

	return (
		<div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-3">
			<div className="order-1 lg:col-span-2">
				<div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-lg">
					<Image
						className="object-cover"
						src={thumbnailUrl}
						alt={course.title}
						fill
						priority
					/>

					<div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
				</div>

				<div className="mt-8 space-y-6">
					<div className="space-y-4">
						<h1 className="text-4xl font-bold tracking-tight">
							{course.title}
						</h1>
						<p className="text-muted-foreground line-clamp-2 text-lg leading-relaxed">
							{course.smallDescription}
						</p>
					</div>

					<div className="flex flex-wrap gap-3">
						<Badge className="flex items-center px-3 py-1">
							<IconChartBar className="size-4" />
							<span>{course.level}</span>
						</Badge>

						<Badge className="flex items-center px-3 py-1">
							<IconCategory className="size-4" />
							<span>{course.category}</span>
						</Badge>

						<Badge className="flex items-center px-3 py-1">
							<IconClock className="size-4" />
							<span>{course.duration}</span>
						</Badge>
					</div>

					<Separator className="my-8" />

					<div className="space-y-6">
						<h2 className="text-3xl font-semibold tracking-tight">
							Course description
						</h2>

						<div>
							<RenderDescription json={JSON.parse(course.description)} />
						</div>
					</div>

					<div className="mt-12 space-y-6">
						<div className="flex items-center justify-between">
							<h2 className="text-3xl font-semibold tracking-tight">
								Course Content
							</h2>

							<div>
								{course.chapters.length} chapters |{" "}
								{course.chapters.reduce(
									(total, chapter) => total + chapter.lessons.length,
									0
								) || 0}{" "}
								lessons
							</div>
						</div>

						<div className="space-y-4">
							{course.chapters.map((chapter, index) => (
								<Collapsible key={chapter.id} defaultOpen={index === 0}>
									{/* oxlint-disable-next-line react-doctor/no-transition-all */}
									<Card className="overflow-hidden border-2 p-0 transition-all duration-200 hover:shadow-md">
										<CollapsibleTrigger>
											<div>
												<CardContent className="hover:bg-muted/50 p-6 transition-colors">
													<div>
														<div>
															<p className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full font-semibold">
																{index + 1}
															</p>

															<div>
																<h3 className="text-left text-xl font-semibold">
																	{chapter.title}
																</h3>

																<p>
																	{chapter.lessons.length} lesson
																	{chapter.lessons.length === 1 ? "" : "s"}
																</p>
															</div>
														</div>
													</div>
												</CardContent>
											</div>
										</CollapsibleTrigger>
									</Card>
								</Collapsible>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
