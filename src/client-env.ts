import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

// Client-safe environment. This file must never contain secrets —
// only VITE_-prefixed public variables validated against import.meta.env.
export const clientEnv = createEnv({
	clientPrefix: "VITE_",
	client: {
		VITE_S3_BUCKET_NAME_IMAGES: z.string(),
	},
	runtimeEnv: { ...import.meta.env },
	emptyStringAsUndefined: true,
});
