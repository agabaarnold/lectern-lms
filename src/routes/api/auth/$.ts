// oxlint-disable sonarjs/function-name
import { createFileRoute } from "@tanstack/react-router";

import { ajAuthed, toArcjetRequest } from "#/lib/arcjet";
import { auth } from "#/lib/auth";

const protectedAuthHandler = async (request: Request) => {
	const decision = await ajAuthed.protect(toArcjetRequest(request));

	if (decision.isErrored()) {
		return auth.handler(request);
	}

	if (decision.isDenied()) {
		if (decision.reason.isRateLimit()) {
			return Response.json({ error: "Too many requests" }, { status: 429 });
		}

		return Response.json({ error: "Forbidden" }, { status: 403 });
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
