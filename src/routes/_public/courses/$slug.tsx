// oxlint-disable shadcn/no-restyle
import {
	IconBook,
	IconCategory,
	IconChartBar,
	IconCheck,
	IconChevronDown,
	IconClock,
	IconPlayerPlay,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

import { RenderDescription } from "#/components/rich-text/render-description.tsx";
// oxlint-disable react/function-component-definition func-style
import { Image } from "#/components/shared/image.tsx";
import { Badge } from "#/components/ui/badge.tsx";
import { Button } from "#/components/ui/button.tsx";
import { Card, CardContent } from "#/components/ui/card.tsx";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "#/components/ui/collapsible.tsx";
import { Separator } from "#/components/ui/separator.tsx";
import { getIndividualCourse } from "#/features/courses/functions/courses.ts";
import { currencyFormatter } from "#/lib/helpers.ts";
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

					<div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent" />
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
									<Card className="gap-0 overflow-hidden border-2 p-0 transition-all duration-200 hover:shadow-md">
										<CollapsibleTrigger>
											<div>
												<CardContent className="hover:bg-muted/50 p-6 transition-colors">
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-4">
															<p className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full font-semibold">
																{index + 1}
															</p>

															<div>
																<h3 className="text-left text-xl font-semibold">
																	{chapter.title}
																</h3>

																<p className="text-muted-foreground mt-1 text-left text-sm">
																	{chapter.lessons.length} lesson
																	{chapter.lessons.length === 1 ? "" : "s"}
																</p>
															</div>
														</div>

														<div className="flex items-center gap-3">
															<Badge className="text-xs" variant="outline">
																{chapter.lessons.length} lesson
																{chapter.lessons.length === 1 ? "" : "s"}
															</Badge>

															<IconChevronDown className="size-4" />
														</div>
													</div>
												</CardContent>
											</div>
										</CollapsibleTrigger>

										<CollapsibleContent>
											<div className="bg-muted/20 border-t">
												<div className="space-y-3 p-6 pt-4">
													{chapter.lessons.map((lesson, lessonIndex) => (
														<div
															className="hover:bg-accent group flex items-center gap-4 rounded-lg p-3 transition-colors"
															key={lesson.id}
														>
															<div className="bg-background border-primary/20 flex size-8 items-center justify-center rounded-full border-2">
																<IconPlayerPlay className="text-muted-foreground group-hover:text-primary size-4 transition-colors" />
															</div>

															<div className="flex-1">
																<p className="text-sm font-medium">
																	{lesson.title}
																</p>

																<p className="text-muted-foreground mt-1 text-xs">
																	Lesson {lessonIndex + 1}
																</p>
															</div>
														</div>
													))}
												</div>
											</div>
										</CollapsibleContent>
									</Card>
								</Collapsible>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Enrollment Card */}
			<div className="order-2 lg:col-span-1">
				<div className="sticky top-20">
					<Card className="py-0">
						<CardContent className="p-6">
							<div className="mb-6 flex items-center justify-between">
								<span className="text-lg font-medium">Price</span>
								<span className="text-primary text-2xl font-bold">
									{currencyFormatter.format(course.price)}
								</span>
							</div>

							<div className="bg-muted mb-6 space-y-3 rounded-lg p-4">
								<h4 className="font-medium">What you will get:</h4>

								<div className="flex flex-col gap-3">
									<div className="flex items-center gap-3">
										<div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full">
											<IconClock className="size-4" />
										</div>

										<div>
											<p className="text-sm font-medium">Course duration</p>
											<p className="text-muted-foreground">
												{course.duration} hours
											</p>
										</div>
									</div>

									<div className="flex items-center gap-3">
										<div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full">
											<IconChartBar className="size-4" />
										</div>

										<div>
											<p className="text-sm font-medium">Difficulty level</p>
											<p className="text-muted-foreground">{course.level}</p>
										</div>
									</div>

									<div className="flex items-center gap-3">
										<div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full">
											<IconCategory className="size-4" />
										</div>

										<div>
											<p className="text-sm font-medium">Category</p>
											<p className="text-muted-foreground">{course.category}</p>
										</div>
									</div>

									<div className="flex items-center gap-3">
										<div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full">
											<IconBook className="size-4" />
										</div>

										<div>
											<p className="text-sm font-medium">Total lessons</p>
											<p className="text-muted-foreground">
												{course.chapters.reduce(
													(total, chapter) => total + chapter.lessons.length,
													0
												) || 0}{" "}
												lessons
											</p>
										</div>
									</div>
								</div>
							</div>

							<div className="mb-6 space-y-3">
								<h4>This course includes:</h4>

								<ul className="space-y-2">
									<li className="flex items-center gap-2 text-sm">
										{/* oxlint-disable-next-line shadcn/no-raw-colors */}
										<div className="rounded-full bg-green-500/10 p-1 text-green-500">
											<IconCheck className="size-3" />
										</div>

										<span>Full lifetime access</span>
									</li>

									<li className="flex items-center gap-2 text-sm">
										{/* oxlint-disable-next-line shadcn/no-raw-colors */}
										<div className="rounded-full bg-green-500/10 p-1 text-green-500">
											<IconCheck className="size-3" />
										</div>

										<span>Access on mobile and desktop</span>
									</li>

									<li className="flex items-center gap-2 text-sm">
										{/* oxlint-disable-next-line shadcn/no-raw-colors */}
										<div className="rounded-full bg-green-500/10 p-1 text-green-500">
											<IconCheck className="size-3" />
										</div>

										<span>Certificate of completion</span>
									</li>
								</ul>
							</div>

							<Button className="w-full" type="button">Enroll now!</Button>

							<p className="text-muted-foreground mt-3 text-center text-xs">
								30-day money-back guarantee
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
