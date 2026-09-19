CREATE TYPE "course_level" AS ENUM('Beginner', 'Intermediate', 'Advanced');--> statement-breakpoint
CREATE TYPE "course_status" AS ENUM('Draft', 'Published', 'Archived');--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" text NOT NULL,
	"description" text NOT NULL,
	"file_key" text NOT NULL,
	"price" integer NOT NULL,
	"duration" integer NOT NULL,
	"level" "course_level" DEFAULT 'Beginner'::"course_level",
	"category" text NOT NULL,
	"small_description" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"status" "course_status" DEFAULT 'Draft'::"course_status",
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;