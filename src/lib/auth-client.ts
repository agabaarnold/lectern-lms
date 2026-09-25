import {
	adminClient,
	inferAdditionalFields,
	lastLoginMethodClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { toast } from "react-hot-toast";

import type { auth } from "./auth";

export const authClient = createAuthClient({
	plugins: [
		adminClient(),
		lastLoginMethodClient(),
		inferAdditionalFields<typeof auth>(),
	],
	fetchOptions: {
		// oxlint-disable-next-line require-await
		onError: async (context) => {
			const { response } = context;
			if (response.status === 429) {
				const retryAfter = response.headers.get("X-Retry-After");
				const seconds = retryAfter ? Math.trunc(Number(retryAfter)) : 60;

				toast.error(
					`Too many requests. Please try again in ${seconds} seconds.`
				);
			}
		},
	},
});
