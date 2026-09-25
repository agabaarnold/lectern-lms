// oxlint-disable shadcn/no-arbitrary-values
import { IconArrowLeft, IconCompass, IconHome } from "@tabler/icons-react";
import { Link, useRouter } from "@tanstack/react-router";

import { Button, buttonVariants } from "#/components/ui/button.tsx";

export const NotFoundComponent = () => {
	const router = useRouter();

	return (
		<div className="relative flex h-screen flex-col items-center justify-center overflow-hidden px-4">
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] mask-[radial-gradient(ellipse_80%_60%_at_50%_50%,black_30%,transparent_100%)] bg-size-[4rem_4rem] opacity-40"
			/>

			<div className="flex max-w-md flex-col items-center gap-8 text-center">
				<div className="border-border bg-muted flex size-20 items-center justify-center rounded-2xl border shadow-lg">
					<IconCompass
						className="text-muted-foreground size-9"
						strokeWidth={1.5}
					/>
				</div>

				<div className="flex flex-col gap-3">
					<p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
						404 - Page not found
					</p>

					<h1 className="text-foreground text-4xl font-semibold tracking-tight">
						Lost in the void
					</h1>

					<p className="text-muted-foreground text-base leading-relaxed">
						The page you&copy;re looking for doesn&copy;t exist or may have been
						moved. Double-check the URL, or head back somewhere familiar.
					</p>
				</div>

				<div className="flex flex-wrap items-center justify-center gap-3">
					<Button
						onClick={() => router.history.back()}
						size="sm"
						variant="outline"
					>
						<IconArrowLeft className="size-4" /> Go back
					</Button>

					<Link
						className={buttonVariants({
							className: "gap-2",
							size: "sm",
						})}
						to="/"
					>
						<IconHome className="size-4" /> Home
					</Link>
				</div>
			</div>
		</div>
	);
};
