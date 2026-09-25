import "@tanstack/react-start/server-only";
import { Stripe } from "stripe";

import { env } from "#/env.server.ts";

export const stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
	apiVersion: "2026-08-26.dahlia",
	typescript: true,
});
