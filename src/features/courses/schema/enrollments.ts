import { z } from "zod";

import { courseIdError } from "./shared";

export const enrollInSchema = z.object({
	courseId: z.uuid({ error: courseIdError }),
});
export type EnrollIn = z.input<typeof enrollInSchema>;
