import { defineRelations } from "drizzle-orm";

import { schema } from "./schema";

export const relations = defineRelations(schema, (r) => ({
	users: {
		courses: r.many.courses({
			from: r.users.id,
			to: r.courses.userId,
		}),
		sessions: r.many.sessions({
			from: r.users.id,
			to: r.sessions.userId,
		}),
		accounts: r.many.accounts({
			from: r.users.id,
			to: r.accounts.userId,
		}),
	},

	courses: {
		user: r.one.users({
			from: r.courses.userId,
			to: r.users.id,
			optional: false,
		}),
		chapters: r.many.chapters({
			from: r.courses.id,
			to: r.chapters.courseId,
		}),
	},

	chapters: {
		course: r.one.courses({
			from: r.chapters.courseId,
			to: r.courses.id,
			optional: false,
		}),
		lessons: r.many.lessons({
			from: r.chapters.id,
			to: r.lessons.chapterId,
		}),
	},

	lessons: {
		chapter: r.one.chapters({
			from: r.lessons.chapterId,
			to: r.chapters.id,
		}),
	},

	sessions: {
		user: r.one.users({
			from: r.sessions.userId,
			to: r.users.id,
			optional: false,
		}),
	},

	accounts: {
		user: r.one.users({
			from: r.accounts.userId,
			to: r.users.id,
			optional: false,
		}),
	},
}));
