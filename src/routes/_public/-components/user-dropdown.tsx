import {
	IconBook,
	IconHome,
	IconLayoutDashboard,
	IconLogout,
} from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "react-hot-toast";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "#/components/ui/avatar.tsx";
import { Button } from "#/components/ui/button.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu.tsx";
import { authClient } from "#/lib/auth-client.ts";
import type { User } from "#/lib/auth.ts";

interface UserDropdownProps {
	user: User;
}

export const UserDropdown = ({ user }: UserDropdownProps) => {
	const navigate = useNavigate();

	const handleSignout = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					navigate({ to: "." });
					toast.success("Logged out successfully");
				},
				onError: ({ error }) => {
					toast.error(error.message ?? "Failed to log you out");
				},
			},
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button size="icon" variant="ghost">
						<Avatar>
							<AvatarImage src={user.image ?? undefined} />
							<AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
						</Avatar>
					</Button>
				}
			/>

			<DropdownMenuContent align="end">
				<DropdownMenuGroup>
					<DropdownMenuLabel className="flex min-w-0 flex-col">
						<span className="text-foreground truncate text-sm font-medium">
							{user.name}
						</span>
						<span className="text-muted-foreground truncate text-xs font-normal">
							{user.email}
						</span>
					</DropdownMenuLabel>

					<DropdownMenuSeparator />

					<DropdownMenuGroup>
						<DropdownMenuItem
							render={
								<Link to="/">
									<IconHome />
									<span>Home</span>
								</Link>
							}
						/>

						<DropdownMenuItem
							render={
								<Link to="/courses">
									<IconBook />
									<span>Courses</span>
								</Link>
							}
						/>

						<DropdownMenuItem
							render={
								<Link to="/admin">
									<IconLayoutDashboard />
									<span>Dashboard</span>
								</Link>
							}
						/>
					</DropdownMenuGroup>

					<DropdownMenuSeparator />

					<DropdownMenuItem onClick={handleSignout} variant="destructive">
						<IconLogout />
						<span>Log out</span>
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
