// oxlint-disable shadcn/no-restyle react/set-state-in-effect
import { DragDropProvider } from "@dnd-kit/react";
import type { UseSortableInput } from "@dnd-kit/react/sortable";
import {
	IconChevronDown,
	IconChevronRight,
	IconFileText,
	IconGripVertical,
	IconTrash,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "#/components/ui/button.tsx";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "#/components/ui/collapsible.tsx";
import type { getCourse } from "#/features/courses/functions/index.ts";

import { NewChapterDialog } from "../edit/-components/new-chapter-dialog";
import { NewLessonDialog } from "../edit/-components/new-lesson-dialog";
import { DeleteLesson } from "./delete-lesson";
import { SortableItem } from "./sortable-item";
import type { CourseStructureItem } from "./use-course-reorder";
import { useCourseReorder } from "./use-course-reorder";

interface CourseStructureProps {
	course: Awaited<ReturnType<typeof getCourse>>;
}

type LessonAcceptPredicate = Extract<
	UseSortableInput["accept"],
	(source: never) => boolean
>;

const acceptLessonFromChapter =
	(chapterId: string): LessonAcceptPredicate =>
	(source) =>
		source.type === "lesson" && "group" in source && source.group === chapterId;

export const CourseStructure = ({ course }: CourseStructureProps) => {
	const initialItems: CourseStructureItem[] =
		course.chapters.map((chapter) => ({
			id: chapter.id,
			title: chapter.title,
			order: chapter.position,
			// default chapters to open
			isOpen: true,
			lessons: chapter.lessons.map((lesson) => ({
				id: lesson.id,
				title: lesson.title,
				order: lesson.position,
			})),
		})) || [];

	const [items, setItems] = useState(initialItems);

	// Keep state in sync
	useEffect(() => {
		setItems((prevItems) => {
			const updatedItems =
				course.chapters.map((chapter) => ({
					id: chapter.id,
					title: chapter.title,
					order: chapter.position,
					isOpen:
						prevItems.find((item) => item.id === chapter.id)?.isOpen ?? true,
					lessons: chapter.lessons.map((lesson) => ({
						id: lesson.id,
						title: lesson.title,
						order: lesson.position,
					})),
				})) || [];

			return updatedItems;
		});
	}, [course]);

	const { handleDragEnd, handleDragStart } = useCourseReorder(
		items,
		setItems,
		course.id
	);

	const toggleChapter = (chapterId: string) => {
		setItems(
			items.map((chapter) =>
				chapter.id === chapterId
					? { ...chapter, isOpen: !chapter.isOpen }
					: chapter
			)
		);
	};

	return (
		<DragDropProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
			<Card>
				<CardHeader className="border-border flex flex-row items-center justify-between border-b">
					<CardTitle>Chapters</CardTitle>

					<NewChapterDialog courseId={course.id} />
				</CardHeader>

				<CardContent className="space-y-8">
					{items.map((item, chapterIndex) => (
						<SortableItem
							accept="chapter"
							id={item.id}
							index={chapterIndex}
							key={item.id}
							type="chapter"
						>
							{(handleRef) => (
								<Card>
									<Collapsible
										open={item.isOpen}
										onOpenChange={() => toggleChapter(item.id)}
									>
										<div className="border-border flex items-center justify-between border-b p-3">
											<div className="flex items-center gap-2">
												<Button
													className="flex items-center"
													ref={handleRef}
													size="icon"
													type="button"
													variant="ghost"
												>
													<IconGripVertical className="size-4" />
												</Button>

												<CollapsibleTrigger
													render={
														<Button
															className="flex items-center"
															size="icon"
															type="button"
															variant="ghost"
														>
															{item.isOpen ? (
																<IconChevronDown className="size-4" />
															) : (
																<IconChevronRight className="size-4" />
															)}
														</Button>
													}
												/>

												<p className="hover:text-primary cursor-pointer">
													{item.title}
												</p>
											</div>

											<Button size="icon" type="button" variant="outline">
												<IconTrash className="size-4" />
											</Button>
										</div>

										<CollapsibleContent>
											<div className="p-1">
												{item.lessons.map((lesson, lessonIndex) => (
													<SortableItem
														accept={acceptLessonFromChapter(item.id)}
														group={item.id}
														id={lesson.id}
														index={lessonIndex}
														key={lesson.id}
														type="lesson"
													>
														{(lessonHandleRef) => (
															<div className="hover:bg-accent flex items-center justify-between rounded-sm p-2">
																<div className="flex items-center gap-2">
																	<Button
																		ref={lessonHandleRef}
																		size="icon"
																		type="button"
																		variant="ghost"
																	>
																		<IconGripVertical className="size-4" />
																	</Button>

																	<IconFileText className="size-4" />

																	<Link
																		to="/admin/courses/$courseId/$categoryId/$lessonId"
																		params={{
																			courseId: course.id,
																			categoryId: item.id,
																			lessonId: lesson.id,
																		}}
																	>
																		{lesson.title}
																	</Link>
																</div>

																<DeleteLesson
																	chapterId={item.id}
																	courseId={course.id}
																	lessonId={lesson.id}
																/>
															</div>
														)}
													</SortableItem>
												))}

												<div className="p-2">
													<NewLessonDialog
														chapterId={item.id}
														courseId={course.id}
													/>
												</div>
											</div>
										</CollapsibleContent>
									</Collapsible>
								</Card>
							)}
						</SortableItem>
					))}
				</CardContent>
			</Card>
		</DragDropProvider>
	);
};
