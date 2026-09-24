import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { getRequest, getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "./lib/auth";
import {
	ajAdmin,
	ajAuthed,
	ajPublic,
	throwIfDenied,
	toArcjetRequest,
} from "./lib/arcjet";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
	const decision = await ajAuthed.protect(toArcjetRequest(getRequest()));
	throwIfDenied(decision);

	const headers = getRequestHeaders();
	const session = await auth.api.getSession({ headers });

	if (!session) {
		throw redirect({ to: "/login" });
	}

	return next({ context: { user: session.user } });
});

export const adminMiddleware = createMiddleware()
	.middleware([authMiddleware])
	.server(async ({ next, context }) => {
		if (context.user.role !== "admin") {
			throw redirect({ to: "/not-admin" });
		}

		const decision = await ajAdmin.protect(toArcjetRequest(getRequest()), {
			userId: context.user.id,
			requested: 1,
		});
		throwIfDenied(decision);

		return next({ context: { user: context.user } });
	});

// Public server functions: Shield + IP rate limit, no bot blocking.
export const arcjetMiddleware = createMiddleware().server(async ({ next }) => {
	const decision = await ajPublic.protect(toArcjetRequest(getRequest()));
	throwIfDenied(decision);

	return next();
});
