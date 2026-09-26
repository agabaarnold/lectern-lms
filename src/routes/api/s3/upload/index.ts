import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createFileRoute } from "@tanstack/react-router";
import { v4 as uuidV4 } from "uuid";
import { z } from "zod";

// oxlint-disable sonarjs/function-name
import { clientEnv } from "#/client-env.ts";
import { S3 } from "#/lib/s3-client.ts";
import {
	IMAGE_CONTENT_TYPES,
	MAX_IMAGE_BYTES,
	MAX_VIDEO_BYTES,
	PRESIGNED_URL_EXPIRES_IN_SECONDS,
	VIDEO_CONTENT_TYPES,
} from "#/lib/upload-policy.ts";
import { adminMiddleware } from "#/middleware.ts";

const allowedContentTypes = (isImage: boolean): readonly string[] =>
	isImage ? IMAGE_CONTENT_TYPES : VIDEO_CONTENT_TYPES;

const maxBytes = (isImage: boolean): number =>
	isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;

export const fileUploadSchema = z
	.object({
		fileName: z
			.string()
			.trim()
			.min(1, { error: "File name is required" })
			.max(255),
		contentType: z.string().min(1, { error: "Content type is required" }),
		size: z.number().int().min(1, { error: "Size is required" }),
		isImage: z.boolean(),
	})
	.refine(
		(data) => allowedContentTypes(data.isImage).includes(data.contentType),
		{
			message: "Unsupported content type for this upload",
			path: ["contentType"],
		}
	)
	.refine((data) => data.size <= maxBytes(data.isImage), {
		message: "File size exceeds the limit for this upload",
		path: ["size"],
	});

export const fileDeleteSchema = z.object({
	key: z.string().trim().min(1, { error: "Object key is required" }).max(1024),
});

export const Route = createFileRoute("/api/s3/upload/")({
	server: {
		middleware: [adminMiddleware],
		handlers: ({ createHandlers }) =>
			createHandlers({
				POST: {
					handler: async ({ request }) => {
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

							const { fileName, contentType, size } = valid.data;

							const safeFileName = fileName.replaceAll(/[/\\]/gu, "");

							if (safeFileName === "") {
								return Response.json(
									{ error: "Invalid file name" },
									{ status: 400 }
								);
							}

							const uniqueKey = `${uuidV4()}-${safeFileName}`;

							const command = new PutObjectCommand({
								Bucket: clientEnv.VITE_S3_BUCKET_NAME_IMAGES,
								ContentType: contentType,
								ContentLength: size,
								Key: uniqueKey,
							});

							const presignedUrl = await getSignedUrl(S3, command, {
								expiresIn: PRESIGNED_URL_EXPIRES_IN_SECONDS,
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
				DELETE: {
					handler: async ({ request }) => {
						try {
							const body = await request.json();

							const valid = fileDeleteSchema.safeParse(body);

							if (!valid.success) {
								return Response.json(
									{ error: "Missing or invalid object key" },
									{ status: 400 }
								);
							}

							const { key } = valid.data;

							const command = new DeleteObjectCommand({
								Bucket: clientEnv.VITE_S3_BUCKET_NAME_IMAGES,
								Key: key,
							});

							await S3.send(command);

							return Response.json(
								{ message: "File deleted successfully" },
								{ status: 200 }
							);
						} catch {
							return Response.json(
								{ error: "Failed to delete file" },
								{ status: 500 }
							);
						}
					},
				},
			}),
	},
});
