import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth/minimal";
import {
	admin,
	captcha,
	haveIBeenPwned,
	lastLoginMethod,
} from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { env } from "#/env.server.ts";

import { db } from "../db";
import { schema } from "../db/schema";
import { ResetPassword } from "../features/email/emails/reset-password.tsx";
import { VerifyEmail } from "../features/email/emails/verify-email.tsx";
import { sendEmail } from "../features/email/lib/send.ts";
import { stripeClient } from "./stripe.ts";

export const auth = betterAuth({
	database: drizzleAdapter(db, { provider: "pg", usePlural: true, schema }),
	baseURL: env.BETTER_AUTH_URL,
	secret: env.BETTER_AUTH_SECRET,
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
	socialProviders: {
		github: {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET,
		},
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
			prompt: "select_account consent",
		},
	},
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["github", "google"],
			updateUserInfoOnLink: true,
		},
	},
	plugins: [
		admin(),
		captcha({
			provider: "hcaptcha",
			secretKey: env.CAPTCHA_SECRET,
			siteKey: env.CAPTCHA_SITE_KEY,
		}),
		haveIBeenPwned(),
		lastLoginMethod({ storeInDatabase: true }),
		stripe({ stripeClient }),
		tanstackStartCookies(),
	],
	rateLimit: {
		enabled: true,
		window: 60,
		max: 60,
		storage: "database",
		customRules: {
			"/sign-in/*": { window: 60, max: 5 },
			"/sign-up/*": { window: 60, max: 3 },
			"/forget-password/*": { window: 60, max: 3 },
			"/request-password-reset": { window: 60, max: 3 },
			"/send-verification-email": { window: 60, max: 3 },
			"/verify-email": { window: 60, max: 5 },
			"/change-password": { window: 60, max: 3 },
			"/change-email": { window: 60, max: 3 },
		},
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
});

export type User = typeof auth.$Infer.Session.user;
