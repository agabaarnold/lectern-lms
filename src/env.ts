import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.url(),
		// Better-Auth config
		BETTER_AUTH_URL: z.url(),
		BETTER_AUTH_SECRET: z.string(),
		// Nodemailer config (optional in development; missing values
		// fall back to a stub transport that logs instead of sending)
		SMTP_HOST: z.string().optional(),
		SMTP_PORT: z.coerce.number().int().min(1).max(65_535).optional(),
		SMTP_USER: z.string().optional(),
		SMTP_PASS: z.string().optional(),
		SMTP_FROM: z.email().optional(),
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
