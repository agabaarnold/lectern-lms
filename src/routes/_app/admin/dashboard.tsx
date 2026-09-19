// oxlint-disable react/function-component-definition func-style
import { createFileRoute } from "@tanstack/react-router";

import data from "#/app/dashboard/data.json";
import { AppSidebar } from "#/components/app-sidebar.tsx";
import { ChartAreaInteractive } from "#/components/chart-area-interactive.tsx";
import { DataTable } from "#/components/data-table.tsx";
import { SectionCards } from "#/components/section-cards.tsx";
import { SiteHeader } from "#/components/site-header.tsx";
import { SidebarInset, SidebarProvider } from "#/components/ui/sidebar.tsx";

export const Route = createFileRoute("/_app/admin/dashboard")({ component: Home });

function Home() {
	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "calc(var(--spacing) * 72)",
					"--header-height": "calc(var(--spacing) * 12)",
				} as React.CSSProperties
			}
		>
			<AppSidebar variant="inset" />
			<SidebarInset>
				<SiteHeader />

				<div className="flex flex-1 flex-col">
					<div className="@container/main flex flex-1 flex-col gap-2">
						<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
							<SectionCards />

							<div className="px-4 lg:px-6">
								<ChartAreaInteractive />
							</div>

							<DataTable data={data} />
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
