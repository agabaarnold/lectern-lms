// oxlint-disable shadcn/no-restyle anti-slop/require-safety-comment-for-type-assertion
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	rectIntersection,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
	IconChevronDown,
	IconChevronRight,
	IconFileText,
	IconGripVertical,
	IconTrash,
} from "@tabler/icons-react";
import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "react-hot-toast";

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
import { reorderLessons } from "#/features/courses/functions/index.ts";

import { SortableItem } from "./sortable-item";

interface CourseStructureProps {
	course: Awaited<ReturnType<typeof getCourse>>;
}

export const CourseStructure = ({ course }: CourseStructureProps) => {
	const initialItems =
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
	const router = useRouter();

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleLessonDrop = async (
		active: DragEndEvent["active"],
		over: NonNullable<DragEndEvent["over"]>
	) => {
		const chapterId = active.data.current?.chapterId as string | undefined;
		const overChapterId = over.data.current?.chapterId as string | undefined;

		if (!chapterId || chapterId !== overChapterId) {
			toast.error(
				"Lesson move between different chapters or invalid chapterId is not allowed."
			);
			return;
		}

		const chapterIndex = items.findIndex((chapter) => chapter.id === chapterId);

		if (chapterIndex === -1) {
			toast.error("Could not find chapter for lesson");
			return;
		}

		const chapterToUpdate = items[chapterIndex];

		const oldLessonIndex = chapterToUpdate.lessons.findIndex(
			(lesson) => lesson.id === active.id
		);
		const newLessonIndex = chapterToUpdate.lessons.findIndex(
			(lesson) => lesson.id === over.id
		);

		if (oldLessonIndex === -1 || newLessonIndex === -1) {
			toast.error("Could not find lesson for reordering");
			return;
		}

		const reorderedLessons = arrayMove(
			chapterToUpdate.lessons,
			oldLessonIndex,
			newLessonIndex
		);

		const updatedLessonForState = reorderedLessons.map((lesson, index) => ({
			...lesson,
			order: index + 1,
		}));

		const newItems = [...items];
		newItems[chapterIndex] = {
			...chapterToUpdate,
			lessons: updatedLessonForState,
		};

		const previousItems = [...items];

		setItems(newItems);

		if (course.id) {
			const lessonsToUpdate = updatedLessonForState.map((lesson) => ({
				id: lesson.id,
				position: lesson.order,
			}));

			const reorderLessonsPromise = () =>
				reorderLessons({
					data: {
						chapterId,
						lessonArray: lessonsToUpdate,
						courseId: course.id,
					},
				});

			toast.promise(reorderLessonsPromise, {
				loading: "Reordering lessons...",
				success: (result) => {
					if (result.updated) {
						return "Lessons reordered successfully";
					}
					throw new Error("Failed to reorder lessons");
				},
				error: () => {
					setItems(previousItems);
					return "Failed to reorder lessons";
				},
			});

			await router.invalidate();
		}

		return;
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over || active.id === over.id) {
			return;
		}

		const activeId = active.id;
		const overId = over.id;
		const activeType = active.data.current?.type as "chapter" | "lesson";
		const overType = over.data.current?.type as "chapter" | "lesson";

		if (activeType === "chapter") {
			let targetChapterId = null;

			if (overType === "chapter") {
				targetChapterId = overId;
			} else if (overType === "lesson") {
				targetChapterId = over.data.current?.chapterId ?? null;
			}

			if (!targetChapterId) {
				toast.error("Could not determine the chapter for reordering.");
				return;
			}

			const oldIndex = items.findIndex((item) => item.id === activeId);
			const newIndex = items.findIndex((item) => item.id === targetChapterId);

			if (oldIndex === -1 || newIndex === -1) {
				toast.error("Could not find chapter old/new index for reordering.");
				return;
			}

			const reorderedLocalChapters = arrayMove(items, oldIndex, newIndex);

			const updatedChaptersForState = reorderedLocalChapters.map(
				(chapter, index) => ({
					...chapter,
					order: index + 1,
				})
			);

			setItems(updatedChaptersForState);
			return;
		}

		if (activeType === "lesson" && overType === "lesson") {
			void handleLessonDrop(active, over);
		}
	};

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
		<DndContext
			collisionDetection={rectIntersection}
			onDragEnd={handleDragEnd}
			sensors={sensors}
		>
			<Card>
				<CardHeader className="border-border flex flex-row items-center justify-between border-b">
					<CardTitle>Chapters</CardTitle>
				</CardHeader>

				<CardContent className="space-y-8">
					<SortableContext items={items} strategy={verticalListSortingStrategy}>
						{items.map((item) => (
							<SortableItem
								data={{ type: "chapter" }}
								id={item.id}
								key={item.id}
							>
								{(listeners) => (
									<Card>
										<Collapsible
											open={item.isOpen}
											onOpenChange={() => toggleChapter(item.id)}
										>
											<div className="border-border flex items-center justify-between border-b p-3">
												<div className="flex items-center gap-2">
													<Button
														className="flex items-center"
														size="icon"
														type="button"
														variant="ghost"
														{...listeners}
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
													<SortableContext
														items={item.lessons.map((lesson) => lesson.id)}
														strategy={verticalListSortingStrategy}
													>
														{item.lessons.map((lesson) => (
															<SortableItem
																key={lesson.id}
																id={lesson.id}
																data={{ type: "lesson", chapterId: item.id }}
															>
																{(lessonListeners) => (
																	<div className="hover:bg-accent flex items-center justify-between rounded-sm p-2">
																		<div className="flex items-center gap-2">
																			<Button
																				size="icon"
																				type="button"
																				variant="ghost"
																				{...lessonListeners}
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

																		<Button size="icon" variant="outline">
																			<IconTrash className="size-4" />
																		</Button>
																	</div>
																)}
															</SortableItem>
														))}
													</SortableContext>

													<div className="p-2">
														<Button className="w-full" variant="outline">
															Create New Lesson
														</Button>
													</div>
												</div>
											</CollapsibleContent>
										</Collapsible>
									</Card>
								)}
							</SortableItem>
						))}
					</SortableContext>
				</CardContent>
			</Card>
		</DndContext>
	);
};
