// oxlint-disable react/function-component-definition func-style
import { createFileRoute } from "@tanstack/react-router";

import { ChartAreaInteractive } from "#/components/sidebar/chart-area-interactive.tsx";
import { SectionCards } from "#/components/sidebar/section-cards.tsx";
import {
	getDashboardStats,
	getEnrollmentStats,
} from "#/features/admin/functions/index.ts";

export const Route = createFileRoute("/_app/admin/")({
	loader: async () => {
		const [dashboardData, enrollmentData] = await Promise.all([
			getDashboardStats(),
			getEnrollmentStats(),
		]);

		return { dashboardData, enrollmentData };
	},
	component: AdminDashboard,
});

function AdminDashboard() {
	const { dashboardData, enrollmentData } = Route.useLoaderData();

	const { totalCourses, totalCustomers, totalLessons, totalSignups } =
		dashboardData;

	return (
		<>
			<SectionCards
				totalCourses={totalCourses}
				totalCustomers={totalCustomers}
				totalLessons={totalLessons}
				totalSignups={totalSignups}
			/>

			<ChartAreaInteractive data={enrollmentData} />
		</>
	);
}
