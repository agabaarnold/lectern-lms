// oxlint-disable shadcn/no-restyle
import { Skeleton } from "#/components/ui/skeleton.tsx";

export const CourseContentSkeleton = () => (
	<output aria-label="Loading lesson">
		<div aria-hidden="true" className="bg-background flex h-full flex-col pl-6">
			<Skeleton className="aspect-video w-full rounded-lg" />

			<div className="border-b py-4">
				<Skeleton className="h-9 w-44" />
			</div>

			<div className="space-y-3 pt-3">
				<Skeleton className="h-9 w-2/3" />

				<div className="space-y-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-1/2" />
				</div>
			</div>
		</div>
	</output>
);
