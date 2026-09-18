import {
	accounts,
	rateLimits,
	sessions,
	users,
	verifications,
} from "./auth.schema";

export const schema = {
	users,
	sessions,
	accounts,
	verifications,
	rateLimits,
} as const;
