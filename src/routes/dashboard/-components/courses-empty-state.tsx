import { IconBook } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import type { LinkOptions } from "@tanstack/react-router";

import { buttonVariants } from "#/components/ui/button.tsx";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "#/components/ui/empty.tsx";

export const CoursesEmptyState = ({
	title,
	description,
	buttonText,
	href,
}: {
	title: string;
	description: string;
	buttonText: string;
	href: LinkOptions["to"];
}) => (
	<Empty className="min-h-[65dvh]">
		<EmptyHeader>
			<EmptyMedia variant="icon">
				<IconBook />
			</EmptyMedia>

			<EmptyTitle>{title}</EmptyTitle>

			<EmptyDescription>{description}</EmptyDescription>
		</EmptyHeader>

		<EmptyContent>
			<Link className={buttonVariants()} to={href}>
				{buttonText}
			</Link>
		</EmptyContent>
	</Empty>
);
