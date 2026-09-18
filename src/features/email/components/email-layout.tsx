import type { ReactNode } from "react";
/* oxlint-disable shadcn/no-raw-colors, shadcn/no-arbitrary-values -- react-email defines its own Tailwind theme via pixelBasedPreset; px values intentional for email clients. */
import {
	Body,
	Container,
	Head,
	Hr,
	Html,
	Preview,
	Section,
	Tailwind,
	Text,
	pixelBasedPreset,
} from "react-email";

interface EmailLayoutProps {
	preview: string;
	children: ReactNode;
}

const emailTheme = {
	brand: "#0D9488",
	background: "#F1F5F9",
	card: "#FFFFFF",
	foreground: "#1E293B",
	muted: "#64748B",
	border: "#E2E8F0",
};

const EmailLayout = ({ preview, children }: EmailLayoutProps) => (
	<Html lang="en" dir="ltr">
		<Tailwind
			config={{
				presets: [pixelBasedPreset],
				theme: {
					extend: {
						colors: {
							brand: emailTheme.brand,
							emailbg: emailTheme.background,
							emailcard: emailTheme.card,
							emailtext: emailTheme.foreground,
							emailmuted: emailTheme.muted,
							emailborder: emailTheme.border,
						},
					},
				},
			}}
		>
			<Head />
			<Body lang="en" dir="ltr" className="bg-emailbg font-sans">
				<Preview>{preview}</Preview>
				<Container className="mx-auto max-w-xl p-5">
					<Section className="bg-emailcard border-emailborder rounded-lg border border-solid p-8">
						{children}
					</Section>
					<Section className="mt-4 text-center">
						<Text className="text-emailmuted text-[12px]">Lectern IMS</Text>
					</Section>
					<Hr className="border-emailborder border border-solid" />
				</Container>
			</Body>
		</Tailwind>
	</Html>
);

export { EmailLayout };
export type { EmailLayoutProps };
