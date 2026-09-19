// oxlint-disable react/function-component-definition func-style
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { Navbar } from "./-components/navbar";

export const Route = createFileRoute("/_public")({
	component: PublicLayout,
});

function PublicLayout() {
	return (
		<div className="">
			<Navbar />

			<main className="container mx-auto px-4 md:px-6 lg:px-8">
				<Outlet />
			</main>
		</div>
	);
}
