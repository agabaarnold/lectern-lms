import confetti from "canvas-confetti";
import type { Options as ConfettiOptions } from "canvas-confetti";
import { useMemo } from "react";

const CONFETTI_COUNT = 200;
const CONFETTI_DEFAULTS = { origin: { y: 0.7 } };

const fireConfetti = (particleRatio: number, opts: ConfettiOptions) => {
	confetti({
		...CONFETTI_DEFAULTS,
		...opts,
		particleCount: Math.floor(CONFETTI_COUNT * particleRatio),
	});
};

const triggerConfetti = () => {
	fireConfetti(0.25, {
		spread: 26,
		startVelocity: 55,
	});
	fireConfetti(0.2, {
		spread: 60,
	});
	fireConfetti(0.35, {
		spread: 100,
		decay: 0.91,
		scalar: 0.8,
	});
	fireConfetti(0.1, {
		spread: 120,
		startVelocity: 25,
		decay: 0.92,
		scalar: 1.2,
	});
	fireConfetti(0.1, {
		spread: 120,
		startVelocity: 45,
	});
};

export const useConfetti = () => useMemo(() => ({ triggerConfetti }), []);
