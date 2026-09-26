import { IconBook } from "@tabler/icons-react";

import { urlConstruct } from "#/lib/url-construct.ts";

export const VideoPlayer = ({
	thumbnailKey,
	videoKey,
}: {
	thumbnailKey: string;
	videoKey: string;
}) => {
	const videoUrl = urlConstruct(videoKey);
	const thumbnailUrl = urlConstruct(thumbnailKey);

	if (!videoKey) {
		return (
			<div className="bg-muted flex aspect-video flex-col items-center justify-center rounded-lg">
				<IconBook className="text-primary mx-auto mb-4 size-16" />

				<p className="text-muted-foreground">
					This lesson does not have a video yet.
				</p>
			</div>
		);
	}

	return (
		<div className="relative aspect-video overflow-hidden rounded-lg bg-black">
			{/* oxlint-disable-next-line jsx-a11y/media-has-caption */}
			<video className="h-full w-full" controls poster={thumbnailUrl}>
				<source src={videoUrl} type="video/mp4" />
				<source src={videoUrl} type="video/webm" />
				<source src={videoUrl} type="video/ogg" />

                Your browser does not support the video tag.
			</video>
		</div>
	);
};
