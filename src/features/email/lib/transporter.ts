import { createTransport } from "nodemailer";

import { env } from "#/env.server.ts";

const isEmailStub = env.SMTP_HOST === undefined;

// Without SMTP config, use a stub transport that composes the message
// without sending. Development logs the composed email instead.
const transporter = env.SMTP_HOST
	? createTransport({
			host: env.SMTP_HOST,
			port: env.SMTP_PORT ?? 587,
			secure: (env.SMTP_PORT ?? 587) === 465,
			auth: {
				user: env.SMTP_USER,
				pass: env.SMTP_PASS,
			},
		})
	: // oxlint-disable-next-line sonarjs/no-clear-text-protocols -- false positive on jsonTransport stub name; no network involved.
		createTransport({ jsonTransport: true });

export { isEmailStub, transporter };
