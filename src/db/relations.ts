import { defineRelations, defineRelationsPart } from "drizzle-orm";

import { schema } from "./schema";
import { accounts, sessions, users, verifications } from "./schema/auth.schema";

export const mainRelations = defineRelations(schema, () => ({}));

export const authRelations = defineRelationsPart(
	{ users, sessions, accounts, verifications },
	(r) => ({
		users: {
			sessions: r.many.sessions({
				from: r.users.id,
				to: r.sessions.userId,
			}),
			accounts: r.many.accounts({
				from: r.users.id,
				to: r.accounts.userId,
			}),
		},
		sessions: {
			user: r.one.users({
				from: r.sessions.userId,
				to: r.users.id,
			}),
		},
		accounts: {
			user: r.one.users({
				from: r.accounts.userId,
				to: r.users.id,
			}),
		},
	})
);