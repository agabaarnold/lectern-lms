// oxlint-disable shadcn/no-restyle
import { cn } from "cn";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import type { FileRejection } from "react-dropzone";
import { toast } from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

import { urlConstruct } from "#/lib/url-construct.ts";

import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import {
	RenderEmptyState,
	RenderErrorState,
	RenderUploadedState,
	RenderUploadingState,
} from "./render-state";

interface UploaderState {
	id: string | null;
	file: File | null;
	uploading: boolean;
	progress: number;
	key?: string;
	isDeleting: boolean;
	error: boolean;
	objectUrl?: string;
	fileType: "image" | "video";
}

const rejectedFiles = (fileRejection: FileRejection[]) => {
	if (fileRejection.length) {
		const tooManyFiles = fileRejection.find(
			(rejection) => rejection.errors[0].code === "too-many-files"
		);

		if (tooManyFiles) {
			return toast.error("Too many files selected, max is 1");
		}

		const fileSizeTooBig = fileRejection.find(
			(rejection) => rejection.errors[0].code === "file-too-large"
		);

		if (fileSizeTooBig) {
			return toast.error("File size exceeds the limit");
		}
	}
};

interface UploaderProps {
	onValueChange: (key: string) => void;
	onBlur?: () => void;
	value?: string;
	fileTypeAccepted: "image" | "video";
}

export const Uploader = ({
	onValueChange,
	onBlur,
	value,
	fileTypeAccepted,
}: UploaderProps) => {
	const fileUrl = urlConstruct(value || "");

	const [fileState, setFileState] = useState<UploaderState>({
		error: false,
		file: null,
		id: null,
		uploading: false,
		progress: 0,
		isDeleting: false,
		fileType: fileTypeAccepted,
		key: value,
		objectUrl: value ? fileUrl : undefined,
	});

	const uploadFile = useCallback(
		async (file: File) => {
			setFileState((prev) => ({ ...prev, uploading: true, progress: 0 }));

			try {
				// 1. Get presigned URL
				const presignedResponse = await fetch("/api/s3/upload", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						fileName: file.name,
						contentType: file.type,
						size: file.size,
						isImage: fileTypeAccepted === "image",
					}),
				});

				if (!presignedResponse.ok) {
					toast.error("Failed to get presigned URL");
					return setFileState((prev) => ({
						...prev,
						uploading: false,
						progress: 0,
						error: true,
					}));
				}

				const { presignedUrl, key } = await presignedResponse.json();

				// Upload progress requires XHR (fetch exposes no upload-progress
				// API), so the XHR event API is wrapped in a promise here.
				// oxlint-disable-next-line promise/avoid-new
				await new Promise<void>((resolve, reject) => {
					const xhr = new XMLHttpRequest();

					xhr.upload.addEventListener("progress", (e) => {
						if (e.lengthComputable) {
							const percentageCompleted = (e.loaded / e.total) * 100;

							setFileState((prev) => ({
								...prev,
								progress: Math.round(percentageCompleted),
							}));
						}
					});

					xhr.addEventListener("load", () => {
						if (xhr.status === 200 || xhr.status === 204) {
							setFileState((prev) => ({
								...prev,
								uploading: false,
								progress: 100,
								key,
							}));

							toast.success("File uploaded successfully");
							onValueChange(key);
							onBlur?.();
							resolve();
						} else {
							reject(new Error("Upload failed..."));
						}
					});

					xhr.addEventListener("error", () => {
						reject(new Error("Upload failed"));
					});

					xhr.open("PUT", presignedUrl);
					xhr.setRequestHeader("Content-Type", file.type);
					xhr.send(file);
				});
			} catch {
				toast.error("Something went wrong");

				setFileState((prev) => ({
					...prev,
					progress: 0,
					error: true,
					uploading: false,
				}));
			}
		},
		[onBlur, onValueChange, fileTypeAccepted]
	);

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			if (acceptedFiles.length > 0) {
				// oxlint-disable-next-line prefer-destructuring
				const file = acceptedFiles[0];

				if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
					URL.revokeObjectURL(fileState.objectUrl);
				}

				setFileState({
					file,
					uploading: false,
					progress: 0,
					objectUrl: URL.createObjectURL(file),
					error: false,
					id: uuidv4(),
					isDeleting: false,
					fileType: fileTypeAccepted,
				});

				onValueChange("");
				uploadFile(file);
			}
		},
		[fileState.objectUrl, onValueChange, uploadFile, fileTypeAccepted]
	);

	useEffect(
		() => () => {
			if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
				URL.revokeObjectURL(fileState.objectUrl);
			}
		},
		[fileState.objectUrl]
	);

	const { getInputProps, getRootProps, isDragActive } = useDropzone({
		onDrop,
		accept:
			fileTypeAccepted === "video" ? { "video/*": [] } : { "image/*": [] },
		maxFiles: 1,
		multiple: false,
		maxSize:
			fileTypeAccepted === "image" ? 5 * 1024 * 1024 : 5000 * 1024 * 1024,
		onDropRejected: rejectedFiles,
		disabled:
			fileState.uploading || (!!fileState.objectUrl && !fileState.error),
	});

	const handleRemoveFile = async () => {
		if (fileState.isDeleting || !fileState.objectUrl) {
			return;
		}

		try {
			setFileState((prev) => ({ ...prev, isDeleting: true }));

			const response = await fetch("/api/s3/upload", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ key: fileState.key }),
			});

			if (!response.ok) {
				toast.error("Failed to remove file from storage");

				setFileState((prev) => ({
					...prev,
					isDeleting: false,
					error: true,
				}));

				return;
			}

			if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
				URL.revokeObjectURL(fileState.objectUrl);
			}

			setFileState(() => ({
				file: null,
				uploading: false,
				progress: 0,
				// oxlint-disable-next-line sonarjs/no-undefined-assignment
				objectUrl: undefined,
				error: false,
				fileType: fileTypeAccepted,
				isDeleting: false,
				id: null,
			}));

			toast.success("File removed successfully");
			onValueChange("");
			onBlur?.();
		} catch {
			toast.error("Error removing file. Please try again.");
			setFileState((prev) => ({
				...prev,
				isDeleting: false,
				error: true,
			}));
		}
	};

	const renderContent = () => {
		if (fileState.uploading && fileState.file) {
			return (
				<RenderUploadingState
					file={fileState.file}
					progress={fileState.progress}
				/>
			);
		}

		if (fileState.error) {
			return <RenderErrorState />;
		}

		if (fileState.objectUrl) {
			return (
				<RenderUploadedState
					previewUrl={fileState.objectUrl}
					handleRemoveFile={handleRemoveFile}
					isDeleting={fileState.isDeleting}
					fileType={fileState.fileType}
				/>
			);
		}

		return <RenderEmptyState isDragActive={isDragActive} />;
	};

	return (
		<Card
			className={cn(
				"relative h-64 w-full border-2 border-dashed transition-colors duration-200",
				isDragActive
					? "border-primary bg-primary/10 border-solid"
					: "border-border hover:border-primary"
			)}
			{...getRootProps()}
		>
			<CardContent className="flex h-full w-full items-center justify-center p-4">
				<Input {...getInputProps()} />

				{renderContent()}
			</CardContent>
		</Card>
	);
};
