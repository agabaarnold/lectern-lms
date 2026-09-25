import {
	IconDotsVertical,
	IconLogout,
	IconHome,
	IconLayoutDashboard,
	IconDeviceTv,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "#/components/ui/avatar.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu.tsx";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "#/components/ui/sidebar.tsx";
import { useSignout } from "#/hooks/use-signout.ts";
import { authClient } from "#/lib/auth-client.ts";

export const NavUser = () => {
	const { isMobile } = useSidebar();
	const { handleSignout } = useSignout();

	const { data: session, isPending } = authClient.useSession();
	if (isPending) {
		return null;
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							// oxlint-disable-next-line shadcn/no-restyle
							<SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
						}
					>
						<Avatar className="size-8">
							<AvatarImage
								src={session?.user.image ?? undefined}
								alt={session?.user.name}
							/>
							<AvatarFallback>
								{session?.user.name[0].toUpperCase()}
							</AvatarFallback>
						</Avatar>

						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-medium">{session?.user.name}</span>
							<span className="text-foreground/70 truncate text-xs">
								{session?.user.email}
							</span>
						</div>
						<IconDotsVertical className="ml-auto size-4" />
					</DropdownMenuTrigger>

					<DropdownMenuContent
						className="min-w-56"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuGroup>
							<DropdownMenuLabel>
								<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
									<Avatar className="size-8">
										<AvatarImage
											src={session?.user.image ?? undefined}
											alt={session?.user.name}
										/>

										<AvatarFallback>
											{session?.user.name[0].toUpperCase()}
										</AvatarFallback>
									</Avatar>

									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-medium">
											{session?.user.name}
										</span>

										<span className="text-muted-foreground truncate text-xs">
											{session?.user.email}
										</span>
									</div>
								</div>
							</DropdownMenuLabel>
						</DropdownMenuGroup>

						<DropdownMenuSeparator />

						<DropdownMenuGroup>
							<DropdownMenuItem
								render={
									<Link to="/">
										<IconHome />
										Homepage
									</Link>
								}
							/>

							<DropdownMenuItem
								render={
									<Link to="/admin">
										<IconLayoutDashboard />
										Dashboard
									</Link>
								}
							/>

							<DropdownMenuItem
								render={
									<Link to="/admin/courses">
										<IconDeviceTv />
										Courses
									</Link>
								}
							/>
						</DropdownMenuGroup>

						<DropdownMenuSeparator />

						<DropdownMenuItem onClick={handleSignout} variant="destructive">
							<IconLogout />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
};
