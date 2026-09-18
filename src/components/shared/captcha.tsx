import { HCaptcha } from "@hcaptcha/react-hcaptcha";
import { useCallback } from "react";

import { env } from "#/env.ts";

interface CaptchaProps {
	/** Called when the captcha is verified successfully */
	onVerify?: (token: string) => void;
	/** Called when the captcha expires */
	onExpire?: () => void;
	/** Called when the captcha fails */
	onError?: (error: string) => void;
	/** Theme for the captcha widget */
	theme?: "light" | "dark" | "contrast";
	/** Size of the captcha widget */
	size?: "normal" | "compact";
	/** Tab index for accessibility */
	tabIndex?: number;
}

export const Captcha = ({
	onVerify,
	onExpire,
	onError,
	theme = "light",
	size = "normal",
	tabIndex = 0,
}: CaptchaProps) => {
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
		<div data-testid="captcha">
			<HCaptcha
				sitekey={env.CAPTCHA_SITE_KEY}
				onVerify={handleVerify}
				onExpire={handleExpire}
				onError={handleError}
				theme={theme}
				size={size}
				tabIndex={tabIndex}
			/>
		</div>
	);
};
