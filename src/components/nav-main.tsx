// oxlint-disable shadcn/no-restyle
import { IconCirclePlusFilled } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import type { LinkOptions } from "@tanstack/react-router";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "#/components/ui/sidebar.tsx";

export const NavMain = ({
	items,
}: {
	items: {
		title: string;
		url: LinkOptions["to"];
		icon?: React.ReactNode;
	}[];
}) => (
	<SidebarGroup>
		<SidebarGroupContent className="flex flex-col gap-2">
			<SidebarMenu>
				<SidebarMenuItem className="flex items-center gap-2">
					<SidebarMenuButton
						tooltip="Quick Create"
						className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 transition duration-200 ease-linear"
						render={
							<Link to="/admin/courses/create">
								<IconCirclePlusFilled />
								<span>Quick Create</span>
							</Link>
						}
					/>
				</SidebarMenuItem>
			</SidebarMenu>

			<SidebarMenu>
				{items.map((item) => (
					<SidebarMenuItem key={item.title}>
						<SidebarMenuButton
							tooltip={item.title}
							render={
								<Link to={item.url}>
									{item.icon}
									<span>{item.title}</span>
								</Link>
							}
						/>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroupContent>
	</SidebarGroup>
);
