import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
	...ultracite,
	useTabs: true,
	// Drizzle generates migration snapshots in its own format;
	// leave them untouched.
	ignorePatterns: [...(ultracite.ignorePatterns ?? []), "drizzle/**"],
});
