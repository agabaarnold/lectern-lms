// oxlint-disable sonarjs/function-name
import type { ArcjetDecision } from "@arcjet/node";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ajForAuthEmail, ajForAuthPath, toArcjetRequest } from "#/lib/arcjet";
import { auth } from "#/lib/auth";

const emailBodySchema = z.object({ email: z.string() });

// Reads `email` from a cloned JSON body so the original request stays
// consumable by the auth handler. Returns undefined when absent/unparseable.
const readEmail = async (request: Request): Promise<string | undefined> => {
	try {
		const parsed = emailBodySchema.safeParse(await request.clone().json());
		return parsed.success ? parsed.data.email : undefined;
	} catch {
		return undefined;
	}
};

const denyResponse = (decision: ArcjetDecision): Response | undefined => {
	if (decision.isErrored()) {
		return undefined;
	}

	if (decision.isDenied()) {
		if (decision.reason.isRateLimit()) {
			return Response.json({ error: "Too many requests" }, { status: 429 });
		}

		if (decision.reason.isEmail()) {
			return Response.json({ error: "Invalid email address" }, { status: 400 });
		}

		return Response.json({ error: "Forbidden" }, { status: 403 });
	}

	return undefined;
};

const protectedAuthHandler = async (request: Request) => {
	const { pathname } = new URL(request.url);
	const arcjetRequest = toArcjetRequest(request);

	const emailClient = ajForAuthEmail(pathname);

	if (emailClient) {
		const email = await readEmail(request);

		if (email !== undefined) {
			const denied = denyResponse(
				await emailClient.protect(arcjetRequest, { email })
			);

			if (denied) {
				return denied;
			}

			return auth.handler(request);
		}
	}

	const denied = denyResponse(
		await ajForAuthPath(pathname).protect(arcjetRequest)
	);

	if (denied) {
		return denied;
	}

	return auth.handler(request);
};

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: ({ request }) => protectedAuthHandler(request),
			POST: ({ request }) => protectedAuthHandler(request),
		},
	},
});
