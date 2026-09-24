import "@tanstack/react-start/server-only";
import arcjet, {
	detectBot,
	shield,
	slidingWindow,
	tokenBucket,
	validateEmail,
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

// Shared Shield + bot-deny base for auth surfaces.
const ajAuthBase = aj.withRule(detectBot({ mode: "LIVE", allow: [] }));

// Authed server functions: IP-keyed sliding window as an outer backstop.
export const ajAuthed = ajAuthBase.withRule(
	slidingWindow({ mode: "LIVE", interval: "60s", max: 100 })
);

// Auth API routes: per-path budgets mirroring the retired Better Auth
// customRules 1:1 (requests per 60s, IP-keyed). `/*` entries match by prefix,
// plain entries match exactly.
const ajAuthStrict = ajAuthBase.withRule(
	slidingWindow({ mode: "LIVE", interval: "60s", max: 3 })
);
const ajAuthMedium = ajAuthBase.withRule(
	slidingWindow({ mode: "LIVE", interval: "60s", max: 5 })
);
const ajAuthDefault = ajAuthBase.withRule(
	slidingWindow({ mode: "LIVE", interval: "60s", max: 60 })
);

type AuthRateClient = typeof ajAuthDefault;

const exactClients = new Map<string, AuthRateClient>([
	["/verify-email", ajAuthMedium],
	["/request-password-reset", ajAuthStrict],
	["/send-verification-email", ajAuthStrict],
	["/change-password", ajAuthStrict],
	["/change-email", ajAuthStrict],
]);

const prefixClients: readonly (readonly [
	prefix: string,
	client: AuthRateClient,
])[] = [
	["/sign-in/", ajAuthMedium],
	["/sign-up/", ajAuthStrict],
	["/forget-password/", ajAuthStrict],
];

export const ajForAuthPath = (pathname: string) => {
	const path = pathname.startsWith("/api/auth")
		? pathname.slice("/api/auth".length)
		: pathname;

	const exact = exactClients.get(path);

	if (exact) {
		return exact;
	}

	for (const [prefix, client] of prefixClients) {
		if (path.startsWith(prefix)) {
			return client;
		}
	}

	return ajAuthDefault;
};

// Email-bearing auth endpoints: same budgets as above plus address
// validation (disposable, invalid, and dead-domain addresses are denied).
// Callers must pass the address from the request body as `{ email }`.
const emailRule = validateEmail({
	mode: "LIVE",
	deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
});

const ajAuthStrictEmail = ajAuthBase
	.withRule(slidingWindow({ mode: "LIVE", interval: "60s", max: 3 }))
	.withRule(emailRule);
const ajAuthMediumEmail = ajAuthBase
	.withRule(slidingWindow({ mode: "LIVE", interval: "60s", max: 5 }))
	.withRule(emailRule);

type AuthEmailClient = typeof ajAuthStrictEmail;

const exactEmailClients = new Map<string, AuthEmailClient>([
	["/request-password-reset", ajAuthStrictEmail],
	["/send-verification-email", ajAuthStrictEmail],
]);

const prefixEmailClients: readonly (readonly [
	prefix: string,
	client: AuthEmailClient,
])[] = [
	["/sign-in/", ajAuthMediumEmail],
	["/sign-up/", ajAuthStrictEmail],
	["/forget-password/", ajAuthStrictEmail],
];

// Email-capable auth paths (credential endpoints whose JSON body carries an
// `email` field). Returns undefined for paths without an address to check —
// callers fall back to ajForAuthPath.
export const ajForAuthEmail = (pathname: string) => {
	const path = pathname.startsWith("/api/auth")
		? pathname.slice("/api/auth".length)
		: pathname;

	const exact = exactEmailClients.get(path);

	if (exact) {
		return exact;
	}

	for (const [prefix, client] of prefixEmailClients) {
		if (path.startsWith(prefix)) {
			return client;
		}
	}
};

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

// Public reads: Shield + generous IP limit. Search engine crawlers stay
// allowed so course pages keep getting indexed; every other bot is denied.
export const ajPublic = aj
	.withRule(detectBot({ mode: "LIVE", allow: ["CATEGORY:SEARCH_ENGINE"] }))
	.withRule(slidingWindow({ mode: "LIVE", interval: "60s", max: 200 }));

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
