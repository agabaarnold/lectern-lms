// oxlint-disable shadcn/no-restyle
import { Card, CardContent } from "#/components/ui/card.tsx";
import { Skeleton } from "#/components/ui/skeleton.tsx";

const PLACEHOLDER_CARDS = [0, 1, 2, 3, 4, 5];

const PublicCourseCardSkeleton = () => (
	<Card aria-hidden="true" className="group relative gap-0 py-0">
		<Skeleton className="absolute top-2 right-2 z-10 h-5 w-16" />

		<Skeleton className="aspect-[3/2] h-full w-full rounded-t-xl rounded-b-none" />

		<CardContent className="p-4">
			<Skeleton className="h-7 w-3/4" />

			<div className="mt-2 space-y-1">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-2/3" />
			</div>

			<div className="mt-4 flex items-center gap-x-5">
				<div className="flex items-center gap-x-2">
					<Skeleton className="size-6 rounded-md" />
					<Skeleton className="h-4 w-10" />
				</div>

				<div className="flex items-center gap-x-2">
					<Skeleton className="size-6 rounded-md" />
					<Skeleton className="h-4 w-10" />
				</div>
			</div>

			<Skeleton className="mt-4 h-9 w-full" />
		</CardContent>
	</Card>
);

export const PublicCoursesLoadingGrid = () => (
	<output
		aria-label="Loading courses"
		className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
	>
		{PLACEHOLDER_CARDS.map((placeholder) => (
			<PublicCourseCardSkeleton key={placeholder} />
		))}
	</output>
);
