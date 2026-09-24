import "@tanstack/react-start/server-only";
import arcjet, {
	detectBot,
	shield,
	slidingWindow,
	tokenBucket,
} from "@arcjet/node";
import type { ArcjetDecision, ArcjetNodeRequest } from "@arcjet/node";
import { setResponseStatus } from "@tanstack/react-start/server";

import { env } from "#/env.server.ts";

// Base client: Shield runs on every protected surface. Omitted `mode` is
// DRY_RUN, so Shield is explicitly LIVE here.
export const aj = arcjet({
	key: env.ARCJET_KEY,
	rules: [shield({ mode: "LIVE" })],
});

// Authed server functions + auth API routes: deny automated clients and apply
// an IP-keyed sliding window as an outer backstop (Better Auth enforces
// stricter per-endpoint limits of its own).
export const ajAuthed = aj
	.withRule(detectBot({ mode: "LIVE", allow: [] }))
	.withRule(slidingWindow({ mode: "LIVE", interval: "60s", max: 100 }));

// Admin mutations: per-user token bucket. Separate client (not withRule) so
// the IP bucket above is not double-spent when adminMiddleware chains
// authMiddleware.
export const ajAdmin = arcjet({
	key: env.ARCJET_KEY,
	rules: [
		tokenBucket({
			mode: "LIVE",
			refillRate: 60,
			interval: "60s",
			capacity: 120,
			characteristics: ["userId"],
		}),
	],
});

// Public reads: Shield + generous IP limit. No bot rule here so search
// engine crawlers keep working.
export const ajPublic = aj.withRule(
	slidingWindow({ mode: "LIVE", interval: "60s", max: 200 })
);

// @arcjet/node speaks IncomingMessage-shaped requests; TanStack Start exposes
// a Fetch Request, so adapt it. No socket is available, therefore client IP
// falls back to forwarding headers (expect an `unverified-header` notice
// until trusted proxies are configured).
export const toArcjetRequest = (request: Request): ArcjetNodeRequest => ({
	headers: Object.fromEntries(request.headers.entries()),
	method: request.method,
	url: request.url,
});

// Server-function denial mapping: 429 for rate limits, 403 otherwise.
// Evaluation errors fail open (log + allow).
export const throwIfDenied = (decision: ArcjetDecision): void => {
	if (decision.isErrored()) {
		console.error("Arcjet evaluation failed open", decision.toString());
		return;
	}

	if (decision.isDenied()) {
		if (decision.reason.isRateLimit()) {
			setResponseStatus(429);
			throw new Error("Too many requests. Please slow down and try again.");
		}

		setResponseStatus(403);
		throw new Error("Request blocked.");
	}
};
