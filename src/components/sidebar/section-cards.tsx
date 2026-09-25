// oxlint-disable shadcn/no-restyle
import {
	IconPlaylistX,
	IconBook,
	IconShoppingCart,
	IconUsers,
} from "@tabler/icons-react";

import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";

interface SectionCardsProps {
	totalSignups: number;
	totalCustomers: number;
	totalCourses: number;
	totalLessons: number;
}

export const SectionCards = ({
	totalCourses,
	totalCustomers,
	totalLessons,
	totalSignups,
}: SectionCardsProps) => (
	<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
		<Card className="@container/card">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<div>
					<CardDescription>Total Signups</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{totalSignups}
					</CardTitle>
				</div>

				<IconUsers className="text-muted-foreground size-6" />
			</CardHeader>

			<CardFooter className="flex-col items-start gap-1.5 text-sm">
				<p className="text-muted-foreground">
					Registered users on the platform
				</p>
			</CardFooter>
		</Card>

		<Card className="@container/card">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<div>
					<CardDescription>Total Customers</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{totalCustomers}
					</CardTitle>
				</div>

				<IconShoppingCart className="text-muted-foreground size-6" />
			</CardHeader>

			<CardFooter className="flex-col items-start gap-1.5 text-sm">
				<p className="text-muted-foreground">
					Users who are enrolled in courses
				</p>
			</CardFooter>
		</Card>

		<Card className="@container/card">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<div>
					<CardDescription>Total Courses</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{totalCourses}
					</CardTitle>
				</div>

				<IconBook className="text-muted-foreground size-6" />
			</CardHeader>

			<CardFooter className="flex-col items-start gap-1.5 text-sm">
				<p className="text-muted-foreground">
					Available courses on the platform
				</p>
			</CardFooter>
		</Card>

		<Card className="@container/card">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<div>
					<CardDescription>Total lessons</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{totalLessons}
					</CardTitle>
				</div>

				<IconPlaylistX className="text-muted-foreground size-6" />
			</CardHeader>

			<CardFooter className="flex-col items-start gap-1.5 text-sm">
				<p className="text-muted-foreground">
					Total learning content available
				</p>
			</CardFooter>
		</Card>
	</div>
);
