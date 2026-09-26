import { useCallback, useEffect, useRef } from "react";

export const useDebouncedCallback = <Args extends unknown[]>(
	callback: (...args: Args) => void,
	delay: number
): ((...args: Args) => void) => {
	const callbackRef = useRef(callback);
	const timeoutRef = useRef(0);

	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

	return useCallback(
		(...args: Args) => {
			window.clearTimeout(timeoutRef.current);
			timeoutRef.current = window.setTimeout(
				() => callbackRef.current(...args),
				delay
			);
		},
		[delay]
	);
};
