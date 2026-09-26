// Single source of truth for upload constraints, shared by the
// client-side dropzone and the server-side presigned-URL validation
// so the two can never drift apart.
export const IMAGE_CONTENT_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
] as const;

export const VIDEO_CONTENT_TYPES = [
	"video/mp4",
	"video/webm",
	"video/ogg",
] as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 5000 * 1024 * 1024;

export const PRESIGNED_URL_EXPIRES_IN_SECONDS = 360;
