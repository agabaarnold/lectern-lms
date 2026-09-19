// oxlint-disable react/function-component-definition func-style
import { createFileRoute } from "@tanstack/react-router";

import data from "#/app/dashboard/data.json";
import { ChartAreaInteractive } from "#/components/sidebar/chart-area-interactive.tsx";
import { DataTable } from "#/components/sidebar/data-table.tsx";
import { SectionCards } from "#/components/sidebar/section-cards.tsx";

export const Route = createFileRoute("/_app/admin/")({
	component: AdminDashboard,
});

function AdminDashboard() {
	return (
		<>
			<SectionCards />

			<div className="px-4 lg:px-6">
				<ChartAreaInteractive />
			</div>

			<DataTable data={data} />
		</>
	);
}
