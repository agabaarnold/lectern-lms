import { IconCloudUpload, IconPhoto, IconX } from "@tabler/icons-react";
import { cn } from "cn";

import { Image } from "../shared/image";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

// TODO: Use the Empty ui component if applicable
export const RenderEmptyState = ({
	isDragActive,
}: {
	isDragActive: boolean;
}) => (
	<div className="text-center">
		<div className="bg-muted mx-auto mb-4 flex size-12 items-center justify-center rounded-full">
			<IconCloudUpload
				className={cn(
					"text-muted-foreground size-6",
					isDragActive && "text-primary"
				)}
			/>
		</div>

		<p className="text-foreground text-base font-semibold">
			Drop your files here or{" "}
			<span className="text-primary cursor-pointer font-bold">
				click to upload
			</span>
		</p>

		<Button className="mt-4" type="button">
			Select a file
		</Button>
	</div>
);

export const RenderErrorState = () => (
	<div className="text-center">
		<div className="bg-destructive/30 mx-auto mb-4 flex size-12 items-center justify-center rounded-full">
			<IconPhoto className="text-destructive size-6" />
		</div>

		<p className="text-base font-semibold">Upload failed</p>
		<p className="text-muted-foreground mt-1 text-xs">Something went wrong</p>

		<Button className="mt-4">Retry selecting a file</Button>
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
			onClick={handleRemoveFile}
			size="icon"
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
