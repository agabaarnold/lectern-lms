// oxlint-disable shadcn/no-restyle
import { IconCirclePlusFilled } from "@tabler/icons-react";
import { Link, useLocation } from "@tanstack/react-router";
import type { LinkOptions } from "@tanstack/react-router";
import { cn } from "cn";

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
		url: LinkOptions["to"] | "#";
		icon?: React.ReactNode;
	}[];
}) => {
	const pathname = useLocation({
		select: (location) => location.pathname,
	});

	return (
		<SidebarGroup>
			<SidebarGroupContent className="flex flex-col gap-2">
				{pathname.startsWith("/admin") && (
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
				)}

				<SidebarMenu>
					{items.map((item) => {
						if (item.url === "#") {
							return (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton tooltip={item.title}>
										{item.icon}
										<span>{item.title}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							);
						}

						return (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton
									tooltip={item.title}
									render={
										<Link
											className={cn(
												item.url === pathname &&
													"bg-accent text-accent-foreground"
											)}
											to={item.url}
										>
											{item.icon}
											<span>{item.title}</span>
										</Link>
									}
								/>
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
};
