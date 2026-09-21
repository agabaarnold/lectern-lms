import {
	accounts,
	rateLimits,
	sessions,
	users,
	verifications,
} from "./auth.schema";
import { chapters, courses, lessons } from "./lms.schema";

export const schema = {
	users,
	sessions,
	accounts,
	verifications,
	rateLimits,
	courses,
	chapters,
	lessons,
} as const;
