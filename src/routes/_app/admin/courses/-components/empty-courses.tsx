import { IconBook } from "@tabler/icons-react";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "#/components/ui/empty.tsx";

export const EmptyCourses = () => (
	<Empty className="min-h-[65dvh]">
		<EmptyHeader>
			<EmptyMedia variant="icon">
				<IconBook />
			</EmptyMedia>

			<EmptyTitle>No courses yet</EmptyTitle>

			<EmptyDescription>
				Get started by creating your first course. It will show up here once you
				save it.
			</EmptyDescription>
		</EmptyHeader>
	</Empty>
);
