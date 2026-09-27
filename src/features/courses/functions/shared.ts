import { db } from "#/db/index.ts";

export const COURSE_NOT_FOUND_MESSAGE = "Course not found";
export const CHAPTER_NOT_FOUND_MESSAGE = "Chapter not found in this course";
export const LESSON_NOT_FOUND_MESSAGE = "Lesson not found in this chapter";
export const ENROLLMENT_REQUIRED_MESSAGE =
	"An active enrollment is required for this course";

// Stripe treats UGX as a zero-decimal currency with a
// backwards-compatibility exception: API amounts must still use
// two-decimal representation with the last two digits `00`. A UGX 60,000
// course is therefore sent as 6,000,000 units, never 60,000.
export const toStripeUgx = (amount: number): number => {
	if (!Number.isInteger(amount) || amount < 1) {
		throw new Error("UGX amount must be a positive whole number");
	}

	return amount * 100;
};

export const fromStripeUgx = (units: number): number => {
	if (!Number.isInteger(units) || units < 100 || units % 100 !== 0) {
		throw new Error("Stripe UGX amount is not a whole shilling value");
	}

	return units / 100;
};

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
