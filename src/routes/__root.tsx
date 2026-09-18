// oxlint-disable react/function-component-definition func-style
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	HeadContent,
	ScriptOnce,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Toaster } from "react-hot-toast";

import { getThemeScript } from "#/components/shared/theme-context.tsx";
import { ThemeProvider } from "#/components/shared/theme-provider.tsx";
import { TooltipProvider } from "#/components/ui/tooltip.tsx";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Lectern",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{ rel: "icon", href: "/logo.png", type: "image/png" },
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<ScriptOnce>{getThemeScript("theme", "system")}</ScriptOnce>
				<HeadContent />
			</head>

			<body>
				<ThemeProvider>
					<TooltipProvider>{children}</TooltipProvider>
					<Toaster />
				</ThemeProvider>

				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
