// oxlint-disable react/function-component-definition func-style
import { createFileRoute } from "@tanstack/react-router";

import { ChartAreaInteractive } from "#/components/sidebar/chart-area-interactive.tsx";
import { SectionCards } from "#/components/sidebar/section-cards.tsx";
import { getDashboardOverview } from "#/features/admin/functions/index.ts";

export const Route = createFileRoute("/_app/admin/analytics/")({
	loader: async () => {
		const overview = await getDashboardOverview();

		return { overview };
	},
	component: AnalyticsPage,
});

function AnalyticsPage() {
	const { overview } = Route.useLoaderData();

	const { totalCourses, totalCustomers, totalLessons, totalSignups } =
		overview.stats;

	return (
		<>
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold">Analytics</h1>

				<p className="text-muted-foreground">
					Track signups, customers, and enrollments across your platform.
				</p>
			</div>

			<SectionCards
				totalCourses={totalCourses}
				totalCustomers={totalCustomers}
				totalLessons={totalLessons}
				totalSignups={totalSignups}
			/>

			<ChartAreaInteractive data={overview.enrollmentChart} />
		</>
	);
}
