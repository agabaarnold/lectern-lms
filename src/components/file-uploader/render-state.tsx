import { IconCloudUpload, IconPhoto, IconX } from "@tabler/icons-react";
import { cn } from "cn";

import { Image } from "../shared/image";
import { Button } from "../ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "../ui/empty";
import { Spinner } from "../ui/spinner";

export const RenderEmptyState = ({
	isDragActive,
}: {
	isDragActive: boolean;
}) => (
	<Empty>
		<EmptyHeader>
			<EmptyMedia variant="icon">
				<IconCloudUpload className={cn(isDragActive && "text-primary")} />
			</EmptyMedia>

			<EmptyTitle>
				Drop your files here or{" "}
				<span className="text-primary cursor-pointer font-bold">
					click to upload
				</span>
			</EmptyTitle>

			<EmptyDescription>Images up to 5MB</EmptyDescription>
		</EmptyHeader>

		<EmptyContent>
			<Button type="button">Select a file</Button>
		</EmptyContent>
	</Empty>
);

export const RenderErrorState = () => (
	<div className="text-center">
		<div className="bg-destructive/30 mx-auto mb-4 flex size-12 items-center justify-center rounded-full">
			<IconPhoto className="text-destructive size-6" />
		</div>

		<p className="text-base font-semibold">Upload failed</p>
		<p className="text-muted-foreground mt-1 text-xs">Something went wrong</p>

		<Button className="mt-4" type="button">
			Retry selecting a file
		</Button>
	</div>
);

export const RenderUploadedState = ({
	previewUrl,
	isDeleting,
	handleRemoveFile,
}: {
	previewUrl: string;
	isDeleting: boolean;
	handleRemoveFile: () => void;
}) => (
	<div>
		<Image
			className="object-contain p-2"
			src={previewUrl}
			alt="Uploaded file"
			fill
		/>

		<Button
			className={cn("absolute top-4 right-4")}
			disabled={isDeleting}
			onClick={(e) => {
				e.stopPropagation();
				handleRemoveFile();
			}}
			size="icon"
			type="button"
			variant="destructive"
		>
			{isDeleting ? (
				<Spinner className="size-4" />
			) : (
				<IconX className="size-4" />
			)}
		</Button>
	</div>
);

export const RenderUploadingState = ({
	progress,
	file,
}: {
	progress: number;
	file: File;
}) => (
	<div className="flex flex-col items-center justify-center text-center">
		<p>{progress}</p>
		<p className="text-foreground mt-2 text-sm font-medium">Uploading...</p>
		<p className="text-muted-foreground mt-1 max-w-xs truncate text-xs">
			{file.name}
		</p>
	</div>
);
