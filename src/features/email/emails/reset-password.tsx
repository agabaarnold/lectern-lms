/* oxlint-disable shadcn/no-raw-colors, shadcn/no-arbitrary-values -- react-email defines its own Tailwind theme via pixelBasedPreset; px values intentional for email clients. */
import { Button, Heading, Link, Text } from "react-email";

import { EmailLayout } from "../components/email-layout.tsx";

interface ResetPasswordProps {
	name?: string;
	resetUrl: string;
}

const ResetPassword = ({ name, resetUrl }: ResetPasswordProps) => {
	const greeting = name ? `Hi ${name},` : "Hi,";

	return (
		<EmailLayout preview="Reset your password">
			<Heading as="h1" className="text-emailtext text-[24px]">
				Reset your password
			</Heading>
			<Text className="text-emailtext text-[14px]">{greeting}</Text>
			<Text className="text-emailmuted text-[14px]">
				We received a request to reset your password. Select the button below to
				choose a new one. This link expires in 1 hour.
			</Text>
			<Button
				href={resetUrl}
				className="bg-brand box-border block rounded px-5 py-3 text-center text-[14px] text-white no-underline"
			>
				Reset password
			</Button>
			<Text className="text-emailmuted text-[12px]">
				If you did not request this, you can safely ignore this email.
			</Text>
			<Link href={resetUrl} className="text-brand text-[12px] underline">
				{resetUrl}
			</Link>
		</EmailLayout>
	);
};

ResetPassword.PreviewProps = {
	name: "Alex",
	resetUrl: "https://example.com/reset-password?token=abc123",
} satisfies ResetPasswordProps;

export default ResetPassword;
export { ResetPassword };
export type { ResetPasswordProps };
