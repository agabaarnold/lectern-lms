import type { ReactElement } from "react";
import { render } from "react-email";
import { z } from "zod";

import { env } from "#/env.ts";

import { transporter } from "./transporter.ts";

const sendEmailSchema = z.object({
	to: z.email(),
	subject: z.string().min(1),
});

interface SendEmailInput {
	to: string;
	subject: string;
	react: ReactElement;
}

const sendEmail = async ({
	to,
	subject,
	react,
}: SendEmailInput): Promise<{ messageId: string }> => {
	const parsed = sendEmailSchema.parse({ to, subject });
	const [html, text] = await Promise.all([
		render(react),
		render(react, { plainText: true }),
	]);
	const info = await transporter.sendMail({
		from: env.SMTP_FROM,
		to: parsed.to,
		subject: parsed.subject,
		html,
		text,
	});

	return { messageId: info.messageId };
};

export { sendEmail };
export type { SendEmailInput };
