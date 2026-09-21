import {
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

import { users } from "./auth.schema";

export const courseLevelEnum = pgEnum("course_level", [
	"Beginner",
	"Intermediate",
	"Advanced",
]);

export const courseStatusEnum = pgEnum("course_status", [
	"Draft",
	"Published",
	"Archived",
]);

export const courses = pgTable("courses", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	fileKey: text("file_key").notNull(),
	price: integer("price").notNull(),
	duration: integer("duration").notNull(),
	level: courseLevelEnum().default("Beginner"),
	category: text("category").notNull(),
	smallDescription: text("small_description").notNull(),
	slug: text("slug").notNull().unique(),
	status: courseStatusEnum().default("Draft"),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const chapters = pgTable("chapters", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: text("title").notNull(),
	position: integer("position").notNull(),
	courseId: uuid("course_id")
		.notNull()
		.references(() => courses.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const lessons = pgTable("lessons", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: text("title").notNull(),
	description: text("description"),
	thumbnailKey: text("thumbnail_key"),
	videoKey: text("video_key"),
	chapterId: uuid("chapter_id")
		.notNull()
		.references(() => chapters.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});
