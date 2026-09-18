import { createTransport } from "nodemailer";

import { env } from "#/env.ts";

const transporter = createTransport({
	host: env.SMTP_HOST,
	port: env.SMTP_PORT,
	secure: env.SMTP_PORT === 465,
	auth: {
		user: env.SMTP_USER,
		pass: env.SMTP_PASS,
	},
});

export { transporter };
