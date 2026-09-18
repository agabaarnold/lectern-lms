/* oxlint-disable shadcn/no-raw-colors, shadcn/no-arbitrary-values -- react-email defines its own Tailwind theme via pixelBasedPreset; px values intentional for email clients. */
import { Button, Heading, Link, Text } from "react-email";

import { EmailLayout } from "../components/email-layout.tsx";

interface VerifyEmailProps {
	name?: string;
	verificationUrl: string;
}

const VerifyEmail = ({ name, verificationUrl }: VerifyEmailProps) => {
	const greeting = name ? `Hi ${name},` : "Hi,";

	return (
		<EmailLayout preview="Verify your email address">
			<Heading as="h1" className="text-emailtext text-[24px]">
				Verify your email
			</Heading>
			<Text className="text-emailtext text-[14px]">{greeting}</Text>
			<Text className="text-emailmuted text-[14px]">
				Thanks for signing up. Select the button below to verify your email
				address and activate your account.
			</Text>
			<Button
				href={verificationUrl}
				className="bg-brand box-border block rounded px-5 py-3 text-center text-[14px] text-white no-underline"
			>
				Verify email
			</Button>
			<Text className="text-emailmuted text-[12px]">
				If the button does not work, copy and paste this link into your browser:
			</Text>
			<Link href={verificationUrl} className="text-brand text-[12px] underline">
				{verificationUrl}
			</Link>
		</EmailLayout>
	);
};

VerifyEmail.PreviewProps = {
	name: "Alex",
	verificationUrl: "https://example.com/verify-email?token=abc123",
} satisfies VerifyEmailProps;

export default VerifyEmail;
export { VerifyEmail };
export type { VerifyEmailProps };
