import {
	IconListDetails,
	IconChartBar,
	IconCamera,
	IconFileDescription,
	IconFileAi,
	IconSettings,
	IconHelp,
	IconSearch,
	IconLayoutDashboard,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import React from "react";

import { NavMain } from "#/components/sidebar/nav-main.tsx";
import type { NavMainItem } from "#/components/sidebar/nav-main.tsx";
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

import { Logo } from "../shared/logo";

const navMain: NavMainItem[] = [
	{
		title: "Dashboard",
		url: "/admin",
		icon: <IconLayoutDashboard />,
	},
	{
		title: "Courses",
		url: "/admin/courses",
		icon: <IconListDetails />,
	},
	{
		title: "Analytics",
		url: "/admin/analytics",
		icon: <IconChartBar />,
	},
];

const ACTIVE_PROPOSALS_TITLE = "Active Proposals";
const ARCHIVED_TITLE = "Archived";

const data = {
	navMain,
	navClouds: [
		{
			title: "Capture",
			icon: <IconCamera />,
			isActive: true,
			url: "#",
			items: [
				{
					title: ACTIVE_PROPOSALS_TITLE,
					url: "#",
				},
				{
					title: ARCHIVED_TITLE,
					url: "#",
				},
			],
		},
		{
			title: "Proposal",
			icon: <IconFileDescription />,
			url: "#",
			items: [
				{
					title: ACTIVE_PROPOSALS_TITLE,
					url: "#",
				},
				{
					title: ARCHIVED_TITLE,
					url: "#",
				},
			],
		},
		{
			title: "Prompts",
			icon: <IconFileAi />,
			url: "#",
			items: [
				{
					title: ACTIVE_PROPOSALS_TITLE,
					url: "#",
				},
				{
					title: ARCHIVED_TITLE,
					url: "#",
				},
			],
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

export const AppSidebar = ({
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
