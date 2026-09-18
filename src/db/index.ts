import { neon } from "@neondatabase/serverless";
import { createServerOnlyFn } from "@tanstack/react-start";
import { drizzle } from "drizzle-orm/neon-http";

import { env } from "#/env.ts";

import { authRelations, mainRelations } from "./relations";

export const db = createServerOnlyFn(() => {
	const dbUrl = env.DATABASE_URL;
	const sql = neon(dbUrl);

	return drizzle({
		client: sql,
		relations: { ...mainRelations, ...authRelations },
	});
});
