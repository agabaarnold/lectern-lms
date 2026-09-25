import {
	IconSettings,
	IconHelp,
	IconSearch,
	IconLayoutDashboard,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import React from "react";

import { Logo } from "#/components/shared/logo.tsx";
import { NavMain } from "#/components/sidebar/nav-main.tsx";
import { NavSecondary } from "#/components/sidebar/nav-secondary.tsx";
import { NavUser } from "#/components/sidebar/nav-user.tsx";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "#/components/ui/sidebar.tsx";

const data = {
	navMain: [
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: <IconLayoutDashboard />,
		},
	],
	navSecondary: [
		{
			title: "Settings",
			url: "#",
			icon: <IconSettings />,
		},
		{
			title: "Get Help",
			url: "#",
			icon: <IconHelp />,
		},
		{
			title: "Search",
			url: "#",
			icon: <IconSearch />,
		},
	],
};

export const DashboardSidebar = ({
	...props
}: React.ComponentProps<typeof Sidebar>) => (
	<Sidebar collapsible="offcanvas" {...props}>
		<SidebarHeader>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton
						// oxlint-disable-next-line shadcn/no-restyle
						className="data-[slot=sidebar-menu-button]:p-1.5!"
						render={
							<Link to="/">
								<Logo className="size-5" />
								<span className="text-base font-semibold">Lectern</span>
							</Link>
						}
					/>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarHeader>

		<SidebarContent>
			<NavMain items={data.navMain} />
			<NavSecondary items={data.navSecondary} className="mt-auto" />
		</SidebarContent>

		<SidebarFooter>
			<NavUser />
		</SidebarFooter>
	</Sidebar>
);
