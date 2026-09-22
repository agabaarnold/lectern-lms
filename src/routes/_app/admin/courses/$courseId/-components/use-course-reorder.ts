// oxlint-disable anti-slop/require-safety-comment-for-type-assertion
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useRouter } from "@tanstack/react-router";
import type { Dispatch, SetStateAction } from "react";
import { toast } from "react-hot-toast";

import {
	reorderChapters,
	reorderLessons,
} from "#/features/courses/functions/index.ts";
import { tryCatch } from "#/lib/try-catch.ts";

export interface CourseStructureLesson {
	id: string;
	title: string;
	order: number;
}

export interface CourseStructureItem {
	id: string;
	title: string;
	order: number;
	isOpen: boolean;
	lessons: CourseStructureLesson[];
}

export const useCourseReorder = (
	items: CourseStructureItem[],
	setItems: Dispatch<SetStateAction<CourseStructureItem[]>>,
	courseId: string
) => {
	const router = useRouter();

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

		const lessonsToUpdate = updatedLessonForState.map((lesson) => ({
			id: lesson.id,
			position: lesson.order,
		}));

		const mutation = reorderLessons({
			data: {
				chapterId,
				lessonArray: lessonsToUpdate,
				courseId,
			},
		});

		toast.promise(mutation, {
			loading: "Reordering lessons...",
			success: "Lessons reordered successfully",
			error: "Failed to reorder lessons",
		});

		const { error } = await tryCatch(mutation);

		if (error) {
			setItems(previousItems);
			return;
		}

		await router.invalidate();
	};

	const handleChapterDrop = async (
		active: DragEndEvent["active"],
		over: NonNullable<DragEndEvent["over"]>
	) => {
		const overType = over.data.current?.type as "chapter" | "lesson";

		let targetChapterId = null;

		if (overType === "chapter") {
			targetChapterId = over.id;
		} else if (overType === "lesson") {
			targetChapterId = over.data.current?.chapterId ?? null;
		}

		if (!targetChapterId) {
			toast.error("Could not determine the chapter for reordering.");
			return;
		}

		const oldIndex = items.findIndex((item) => item.id === active.id);
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

		const previousItems = [...items];

		setItems(updatedChaptersForState);

		const chaptersToUpdate = updatedChaptersForState.map((chapter) => ({
			id: chapter.id,
			position: chapter.order,
		}));

		const mutation = reorderChapters({
			data: { chaptersArray: chaptersToUpdate, courseId },
		});

		toast.promise(mutation, {
			loading: "Reordering chapters...",
			success: "Chapters reordered successfully",
			error: "Failed to reorder chapters",
		});

		const { error } = await tryCatch(mutation);

		if (error) {
			setItems(previousItems);
			return;
		}

		await router.invalidate();
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over || active.id === over.id) {
			return;
		}

		const activeType = active.data.current?.type as "chapter" | "lesson";
		const overType = over.data.current?.type as "chapter" | "lesson";

		if (activeType === "chapter") {
			void handleChapterDrop(active, over);
			return;
		}

		if (activeType === "lesson" && overType === "lesson") {
			void handleLessonDrop(active, over);
		}
	};

	return { handleDragEnd };
};
