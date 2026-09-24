import {
	accounts,
	rateLimits,
	sessions,
	users,
	verifications,
} from "./auth.schema";
import { chapters, courses, enrollments, lessons } from "./lms.schema";

export const schema = {
	users,
	sessions,
	accounts,
	verifications,
	rateLimits,
	courses,
	chapters,
	lessons,
	enrollments,
} as const;
