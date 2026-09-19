// oxlint-disable react/function-component-definition func-style anti-slop/require-safety-comment-for-type-assertion
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AppSidebar } from "#/components/sidebar/app-sidebar.tsx";
import { SiteHeader } from "#/components/sidebar/site-header.tsx";
import { SidebarInset, SidebarProvider } from "#/components/ui/sidebar.tsx";

export const Route = createFileRoute("/_app/admin")({
	component: AdminLayout,
});

function AdminLayout() {
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
						<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
							<Outlet/>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
