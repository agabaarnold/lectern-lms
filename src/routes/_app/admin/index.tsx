// oxlint-disable react/function-component-definition func-style
import { createFileRoute } from "@tanstack/react-router";

import { ChartAreaInteractive } from "#/components/sidebar/chart-area-interactive.tsx";
import { SectionCards } from "#/components/sidebar/section-cards.tsx";
import { getDashboardStats } from "#/features/admin/functions/index.ts";

export const Route = createFileRoute("/_app/admin/")({
	loader: () => getDashboardStats(),
	component: AdminDashboard,
});

function AdminDashboard() {
	const { totalCourses, totalCustomers, totalLessons, totalSignups } =
		Route.useLoaderData();

	return (
		<>
			<SectionCards
				totalCourses={totalCourses}
				totalCustomers={totalCustomers}
				totalLessons={totalLessons}
				totalSignups={totalSignups}
			/>

			<ChartAreaInteractive />
		</>
	);
}
