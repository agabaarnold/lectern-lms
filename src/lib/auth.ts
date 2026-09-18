import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth/minimal";
import { haveIBeenPwned, lastLoginMethod } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { db } from "../db";
import { schema } from "../db/schema";

export const auth = betterAuth({
	database: drizzleAdapter(db, { provider: "pg", usePlural: true, schema }),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [
		haveIBeenPwned(),
		lastLoginMethod({ storeInDatabase: true }),
		tanstackStartCookies(),
	],
});

export type User = typeof auth.$Infer.Session.user;
