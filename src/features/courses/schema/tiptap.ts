import type { JSONContent } from "@tiptap/react";
import { z } from "zod";

// Structural validation for TipTap editor JSON. Intentionally loose:
// it guarantees a well-formed document envelope without pinning the
// exact node/mark set emitted by the editor's extensions.
const tiptapMarkSchema = z.looseObject({
	type: z.string(),
});

const tiptapNodeSchema: z.ZodType<unknown> = z.lazy(() =>
	z.looseObject({
		type: z.string(),
		attrs: z.record(z.string(), z.unknown()).optional(),
		content: z.array(tiptapNodeSchema).optional(),
		text: z.string().optional(),
		marks: z.array(tiptapMarkSchema).optional(),
	})
);

export const tiptapDocSchema = z.looseObject({
	type: z.literal("doc"),
	content: z.array(tiptapNodeSchema),
});

export const isTiptapJsonString = (value: string): boolean => {
	if (value === "") {
		return true;
	}

	let parsed: unknown;

	try {
		parsed = JSON.parse(value);
	} catch {
		return false;
	}

	return tiptapDocSchema.safeParse(parsed).success;
};

export const tiptapJsonStringSchema = z.string().refine(isTiptapJsonString, {
	error: "Description must be valid rich text content",
});

export const parseTiptapDocument = (raw: string): JSONContent | null => {
	let parsed: unknown;

	try {
		parsed = JSON.parse(raw);
	} catch {
		return null;
	}

	const result = tiptapDocSchema.safeParse(parsed);

	if (!result.success) {
		return null;
	}

	// SAFETY: document envelope validated above; JSONContent is TipTap's
	// loose JSON document type, so the validated unknown is assignable.
	return result.data as JSONContent;
};
