import { useCallback, useState } from "react";

export const useCaptcha = () => {
	const [captchaToken, setCaptchaToken] = useState<string | null>(null);

	const handleVerify = useCallback((token: string) => {
		setCaptchaToken(token);
	}, []);

	const handleExpire = useCallback(() => {
		setCaptchaToken(null);
	}, []);

	const reset = useCallback(() => {
		setCaptchaToken(null);
	}, []);

	return {
		token: captchaToken,
		onVerify: handleVerify,
		onExpire: handleExpire,
		reset,
	};
};
