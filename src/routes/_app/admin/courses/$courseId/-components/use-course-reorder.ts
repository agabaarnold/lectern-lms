import type { DragEndEvent, DragStartEvent } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { useRouter } from "@tanstack/react-router";
import type { Dispatch, SetStateAction } from "react";
import { useRef } from "react";
import { toast } from "react-hot-toast";

import { reorderChapters } from "#/features/courses/functions/chapters.ts";
import { reorderLessons } from "#/features/courses/functions/lessons.ts";
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
	const snapshot = useRef(items);

	const persistLessonOrder = async (
		chapterId: string,
		initialIndex: number,
		index: number
	) => {
		const chapterIndex = items.findIndex((chapter) => chapter.id === chapterId);

		if (chapterIndex === -1) {
			toast.error("Could not find chapter for lesson");
			return;
		}

		const chapterToUpdate = items[chapterIndex];
		const reorderedLessons = [...chapterToUpdate.lessons];
		const [movedLesson] = reorderedLessons.splice(initialIndex, 1);
		reorderedLessons.splice(index, 0, movedLesson);

		const updatedLessonForState = reorderedLessons.map((lesson, position) => ({
			...lesson,
			order: position + 1,
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

	const persistChapterOrder = async (initialIndex: number, index: number) => {
		const reorderedChapters = [...items];
		const [movedChapter] = reorderedChapters.splice(initialIndex, 1);
		reorderedChapters.splice(index, 0, movedChapter);

		const updatedChaptersForState = reorderedChapters.map(
			(chapter, position) => ({
				...chapter,
				order: position + 1,
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

	const handleDragStart = (_event: DragStartEvent) => {
		snapshot.current = items;
	};

	const handleDragEnd = (event: DragEndEvent) => {
		if (event.canceled) {
			setItems(snapshot.current);
			return;
		}

		const { source } = event.operation;

		if (!isSortable(source)) {
			return;
		}

		if (source.type === "chapter") {
			if (source.initialIndex === source.index) {
				return;
			}

			void persistChapterOrder(source.initialIndex, source.index);
			return;
		}

		if (source.type === "lesson") {
			const { group, initialGroup } = source;

			if (group === undefined || initialGroup === undefined) {
				return;
			}

			const targetChapter = items.find((chapter) => chapter.id === group);

			if (!targetChapter || initialGroup !== group) {
				toast.error(
					"Lesson move between different chapters or invalid chapterId is not allowed."
				);
				setItems(snapshot.current);
				return;
			}

			if (source.initialIndex === source.index) {
				return;
			}

			void persistLessonOrder(
				targetChapter.id,
				source.initialIndex,
				source.index
			);
		}
	};

	return { handleDragEnd, handleDragStart };
};
