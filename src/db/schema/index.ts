import { accounts, sessions, users, verifications } from "./auth.schema";
import { chapters, courses, enrollments, lessons } from "./lms.schema";

export const schema = {
	users,
	sessions,
	accounts,
	verifications,
	courses,
	chapters,
	lessons,
	enrollments,
} as const;
