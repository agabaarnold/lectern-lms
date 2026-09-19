import { Link } from "@tanstack/react-router";
import type { LinkOptions } from "@tanstack/react-router";

import { Image } from "#/components/shared/image.tsx";
import { ThemeToggle } from "#/components/shared/theme-toggle.tsx";
import { buttonVariants } from "#/components/ui/button.tsx";
import { authClient } from "#/lib/auth-client.ts";

import { UserDropdown } from "./user-dropdown";

interface NavItems {
	name: string;
	href: LinkOptions["to"];
}

const navItems: NavItems[] = [
	{ name: "Home", href: "/" },
	{ name: "Course", href: "/courses" },
	{ name: "Dashboard", href: "/admin/dashboard" },
];

export const Navbar = () => {
	const { data: session, isPending } = authClient.useSession();

	return (
		<header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
			<div className="container mx-auto flex min-h-16 items-center px-4 md:px-6 lg:px-8">
				<Link className="mr-4 flex items-center space-x-2" to="/">
					<Image
						src="./logo.png"
						alt="Logo"
						className="size-9 rounded-xs dark:bg-white"
					/>
					<span>Lectern</span>
				</Link>

				{/* Desktop navigation */}
				<nav className="hidden md:flex md:flex-1 md:items-center md:justify-between">
					<div className="flex items-center space-x-2">
						{navItems.map((item) => (
							<Link
								className="hover:text-primary text-sm font-medium transition-colors"
								key={item.name}
								to={item.href}
							>
								{item.name}
							</Link>
						))}
					</div>

					<div className="flex items-center justify-center space-x-3">
						<ThemeToggle />

						{/*  oxlint-disable-next-line no-nested-ternary sonarjs/no-nested-conditional */}
						{isPending ? null : session ? (
							<UserDropdown user={session.user} />
						) : (
							<>
								<Link
									className={buttonVariants({ variant: "secondary" })}
									to="/login"
								>
									Login
								</Link>

								<Link className={buttonVariants()} to="/register">
									Get Started
								</Link>
							</>
						)}
					</div>
				</nav>
			</div>
		</header>
	);
};
