import { IconMoon, IconSun } from "@tabler/icons-react";

import { Button } from "#/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { useTheme } from "#/hooks/use-theme.ts";

export const ThemeToggle = () => {
	const { setTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button variant="outline" size="icon">
						<IconSun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
						<IconMoon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
						<span className="sr-only">Toggle theme</span>
					</Button>
				}
			/>

			<DropdownMenuContent align="end">
				<DropdownMenuGroup>
					<DropdownMenuItem onClick={() => setTheme("light")}>
						Light
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme("dark")}>
						Dark
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme("system")}>
						System
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
