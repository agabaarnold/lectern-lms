// oxlint-disable shadcn/no-restyle
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	rectIntersection,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
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

import { SortableItem } from "./sortable-item";
import type { CourseStructureItem } from "./use-course-reorder";
import { useCourseReorder } from "./use-course-reorder";

interface CourseStructureProps {
	course: Awaited<ReturnType<typeof getCourse>>;
}

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

		const { handleDragEnd } = useCourseReorder(items, setItems, course.id);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
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
