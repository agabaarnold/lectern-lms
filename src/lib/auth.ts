import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth/minimal";
import { haveIBeenPwned, lastLoginMethod } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { db } from "../db";
import { schema } from "../db/schema";
import { ResetPassword } from "../features/email/emails/reset-password.tsx";
import { VerifyEmail } from "../features/email/emails/verify-email.tsx";
import { sendEmail } from "../features/email/lib/send.ts";

export const auth = betterAuth({
	database: drizzleAdapter(db, { provider: "pg", usePlural: true, schema }),
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				subject: "Reset your password",
				react: ResetPassword({
					resetUrl: url,
					name: user.name ?? undefined,
				}),
			});
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		expiresIn: 60 * 60,
		sendVerificationEmail: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				subject: "Verify your email address",
				react: VerifyEmail({
					verificationUrl: url,
					name: user.name ?? undefined,
				}),
			});
		},
	},
	plugins: [
		haveIBeenPwned(),
		lastLoginMethod({ storeInDatabase: true }),
		tanstackStartCookies(),
	],
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
});

export type User = typeof auth.$Infer.Session.user;
