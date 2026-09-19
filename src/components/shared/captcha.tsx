import { HCaptcha } from "@hcaptcha/react-hcaptcha";
import { cn } from "cn";
import { useCallback, useEffect, useState } from "react";

import { clientEnv } from "#/client-env.ts";
import { useTheme } from "#/hooks/use-theme.ts";

interface CaptchaProps {
	/** Called when the captcha is verified successfully */
	onVerify?: (token: string) => void;
	/** Called when the captcha expires */
	onExpire?: () => void;
	/** Called when the captcha fails */
	onError?: (error: string) => void;
	/**
	 * Theme for the captcha widget.
	 * Defaults to the current app theme so the iframe blends in with light/dark mode.
	 */
	theme?: "light" | "dark" | "contrast";
	/** Size of the captcha widget */
	size?: "normal" | "compact";
	/** Tab index for accessibility */
	tabIndex?: number;
	/** Additional classes for the wrapper around the iframe widget */
	className?: string;
}

export const Captcha = ({
	onVerify,
	onExpire,
	onError,
	theme,
	size = "normal",
	tabIndex = 0,
	className,
}: CaptchaProps) => {
	const { theme: appTheme } = useTheme();
	const [prefersDark, setPrefersDark] = useState(
		() =>
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches
	);

	useEffect(() => {
		if (theme !== undefined || appTheme !== "system") {
			return;
		}

		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = (event: MediaQueryListEvent) => {
			setPrefersDark(event.matches);
		};
		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, [theme, appTheme]);

	let effectiveTheme: "light" | "dark" | "contrast" = "light";
	if (theme !== undefined) {
		effectiveTheme = theme;
	} else if (appTheme === "dark" || appTheme === "light") {
		effectiveTheme = appTheme;
	} else if (prefersDark) {
		effectiveTheme = "dark";
	}
	const handleVerify = useCallback(
		(token: string) => {
			onVerify?.(token);
		},
		[onVerify]
	);

	const handleExpire = useCallback(() => {
		onExpire?.();
	}, [onExpire]);

	const handleError = useCallback(
		(error: string) => {
			onError?.(error);
		},
		[onError]
	);

	return (
		<div
			className={cn(
				"flex min-h-19.5 w-full items-center justify-center",
				className
			)}
			data-testid="captcha"
		>
			<HCaptcha
				key={`${effectiveTheme}-${size}`}
				sitekey={clientEnv.VITE_CAPTCHA_SITE_KEY}
				onVerify={handleVerify}
				onExpire={handleExpire}
				onError={handleError}
				theme={effectiveTheme}
				size={size}
				tabIndex={tabIndex}
			/>
		</div>
	);
};
