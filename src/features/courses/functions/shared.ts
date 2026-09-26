import { db } from "#/db/index.ts";

export const COURSE_NOT_FOUND_MESSAGE = "Course not found";
export const CHAPTER_NOT_FOUND_MESSAGE = "Chapter not found in this course";
export const LESSON_NOT_FOUND_MESSAGE = "Lesson not found in this chapter";
export const ENROLLMENT_REQUIRED_MESSAGE =
	"An active enrollment is required for this course";

export const requireActiveEnrollment = async (
	userId: string,
	courseId: string
): Promise<void> => {
	const enrollment = await db.query.enrollments.findFirst({
		where: { userId, courseId, status: "Active" },
		columns: { id: true },
	});

	if (!enrollment) {
		throw new Error(ENROLLMENT_REQUIRED_MESSAGE);
	}
};
