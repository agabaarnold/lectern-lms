import { accounts, sessions, users, verifications } from "./auth.schema";
import {
	chapters,
	courses,
	enrollments,
	lessonProgress,
	lessons,
} from "./lms.schema";

export const schema = {
	users,
	sessions,
	accounts,
	verifications,
	courses,
	chapters,
	lessons,
	enrollments,
	lessonProgress,
} as const;
