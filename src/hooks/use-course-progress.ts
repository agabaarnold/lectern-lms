import { useMemo } from "react";

import type { getCourseSiderbarData } from "#/features/courses/functions/courses.ts";

interface CourseProgressData {
	course: Awaited<ReturnType<typeof getCourseSiderbarData>>["course"];
}

interface CourseProgress {
	totalLessons: number;
	completedLessons: number;
	progressPercentage: number;
}

export const useCourseProgress = ({
	course,
}: CourseProgressData): CourseProgress =>
	useMemo(() => {
		let totalLessons = 0;
		let completedLessons = 0;

		for (const chapter of course.chapters) {
			for (const lesson of chapter.lessons) {
				totalLessons += 1;

				// check if this lesson is completed
				const isCompleted = lesson.lessonProgress.some(
					(progress) => progress.lessonId === lesson.id && progress.completed
				);

				if (isCompleted) {
					completedLessons += 1;
				}
			}
		}

		const progressPercentage =
			totalLessons > 0
				? Math.round((completedLessons / totalLessons) * 100)
				: 0;

		return { completedLessons, progressPercentage, totalLessons };
	}, [course]);
