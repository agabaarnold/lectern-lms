import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.url(),
		// Better-Auth config
		BETTER_AUTH_URL: z.url(),
		BETTER_AUTH_SECRET: z.string(),
		// Nodemailer config
		SMTP_HOST: z.string(),
		SMTP_PORT: z.coerce.number().int().min(1).max(65_535),
		SMTP_USER: z.string(),
		SMTP_PASS: z.string(),
		SMTP_FROM: z.email(),
		// Google config
		GOOGLE_CLIENT_ID: z.string(),
		GOOGLE_CLIENT_SECRET: z.string(),
		// Github config
		GITHUB_CLIENT_ID: z.string(),
		GITHUB_CLIENT_SECRET: z.string(),
		// Node environment
		NODE_ENV: z.enum(["development", "production"]).default("production"),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
