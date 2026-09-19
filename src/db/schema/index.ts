import {
	accounts,
	rateLimits,
	sessions,
	users,
	verifications,
} from "./auth.schema";
import { courses } from "./lms.schema";

export const schema = {
	users,
	sessions,
	accounts,
	verifications,
	rateLimits,
	courses,
} as const;
