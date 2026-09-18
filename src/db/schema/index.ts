import { accounts, sessions, users, verifications } from "./auth.schema";

export const schema = { users, sessions, accounts, verifications } as const;
