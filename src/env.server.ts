import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

// Server-only environment. NEVER import this file in client components —
// use "#/env.client.ts" instead. Importing this file client-side would bundle
// secrets and throw on access (see @t3-oss/env-core onInvalidAccess).
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
		// Tigris S3 config
		AWS_ACCESS_KEY_ID: z.string(),
		AWS_SECRET_ACCESS_KEY: z.string(),
		AWS_ENDPOINT_URL_S3: z.url(),
		AWS_ENDPOINT_URL_IAM: z.url(),
		AWS_REGION: z.string(),
		// Stripe configuration
		STRIPE_SECRET_KEY: z.string(),
		STRIPE_WEBHOOK_SECRET: z.string(),
		// Arcjet configuration
		ARCJET_KEY: z.string(),
	},
	runtimeEnv: { ...process.env, ...import.meta.env },
	emptyStringAsUndefined: true,
});
