import { clientEnv } from "#/client-env.ts";

export const urlConstruct = (key: string) =>
	`https://${clientEnv.VITE_S3_BUCKET_NAME_IMAGES}.t3.tigrisfiles.io/${key}`;
