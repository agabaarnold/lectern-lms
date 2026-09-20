import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createFileRoute } from "@tanstack/react-router";
import { v4 as uuidV4 } from "uuid";
import { z } from "zod";

// oxlint-disable sonarjs/function-name
import { clientEnv } from "#/client-env.ts";
import { S3 } from "#/lib/s3-client.ts";

export const fileUploadSchema = z.object({
	fileName: z.string().min(1, { error: "File name is required" }),
	contentType: z.string().min(1, { error: "Content type is required" }),
	size: z.number().min(1, { error: "Size is required" }),
	isImage: z.boolean(),
});

export const Route = createFileRoute("/api/s3/upload/")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const body = await request.json();

					const valid = fileUploadSchema.safeParse(body);

					if (!valid.success) {
						return Response.json(
							{
								error: "Invalid request body",
								issues: valid.error.issues,
							},
							{ status: 400 }
						);
					}

					const { fileName, contentType, size, isImage } = valid.data;

					const uniqueKey = `${uuidV4()}-${fileName}`;

					const command = new PutObjectCommand({
						Bucket: clientEnv.VITE_S3_BUCKET_NAME_IMAGES,
						ContentType: contentType,
						ContentLength: size,
						Key: uniqueKey,
					});

					const presignedUrl = await getSignedUrl(S3, command, {
						// Url expires in 6 minutes
						expiresIn: 360,
					});

					const response = { presignedUrl, key: uniqueKey };

					return Response.json(response);
				} catch {
					return Response.json(
						{ error: "Failed to generate presigned URL" },
						{ status: 500 }
					);
				}
			},
		},
	},
});
