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
		enrollments: r.many.enrollments({
			from: r.users.id,
			to: r.enrollments.userId,
		}),
		lessonProgress: r.many.lessonProgress({
			from: r.users.id,
			to: r.lessonProgress.userId,
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
		enrollments: r.many.enrollments({
			from: r.courses.id,
			to: r.enrollments.courseId,
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

	enrollments: {
		user: r.one.users({
			from: r.enrollments.userId,
			to: r.users.id,
			optional: false,
		}),
		course: r.one.courses({
			from: r.enrollments.courseId,
			to: r.courses.id,
			optional: false,
		}),
	},

	lessons: {
		chapter: r.one.chapters({
			from: r.lessons.chapterId,
			to: r.chapters.id,
			optional: false,
		}),
		lessonProgress: r.many.lessonProgress({
			from: r.lessons.id,
			to: r.lessonProgress.lessonId,
		}),
	},

	lessonProgress: {
		lesson: r.one.lessons({
			from: r.lessonProgress.lessonId,
			to: r.lessons.id,
			optional: false,
		}),
		user: r.one.users({
			from: r.lessonProgress.userId,
			to: r.users.id,
			optional: false,
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
