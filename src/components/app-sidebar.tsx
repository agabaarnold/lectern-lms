import {
	IconListDetails,
	IconChartBar,
	IconFolder,
	IconUsers,
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

import { NavMain } from "#/components/nav-main.tsx";
import { NavSecondary } from "#/components/nav-secondary.tsx";
import { NavUser } from "#/components/nav-user.tsx";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "#/components/ui/sidebar.tsx";

import { Image } from "./shared/image";

const data = {
	navMain: [
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
			url: "#",
			icon: <IconChartBar />,
		},
		{
			title: "Projects",
			url: "#",
			icon: <IconFolder />,
		},
		{
			title: "Team",
			url: "#",
			icon: <IconUsers />,
		},
	],
	navClouds: [
		{
			title: "Capture",
			icon: <IconCamera />,
			isActive: true,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
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
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
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
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
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
								<Image
									src="/logo.png"
									alt="Logo"
									className="size-5 rounded-xs dark:bg-white"
								/>
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
