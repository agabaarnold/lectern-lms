// oxlint-disable shadcn/no-raw-colors no-nested-ternary sonarjs/no-nested-conditional shadcn/no-arbitrary-values
import { IconCheck, IconPlayerPlay } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";

import { buttonVariants } from "#/components/ui/button.tsx";

interface LessonItemProps {
	lesson: {
		id: string;
		title: string;
		position: number;
		description: string | null;
	};
	slug: string;
	isActive: boolean;
}

export const LessonItem = ({ lesson, slug, isActive }: LessonItemProps) => {
	const completed = false;

	return (
		<Link
			className={buttonVariants({
				variant: completed ? "secondary" : "outline",
				className: cn(
					"h-auto w-full justify-start p-2.5 transition-all",
					completed &&
						"border-green-300 bg-green-100 text-green-800 hover:bg-green-200 dark:border-green-700 dark:bg-green-900/30 dark:text-green-200 dark:hover:bg-green-900/50",
					isActive &&
						!completed &&
						"bg-primary10 dark:bg-primary/20 border-primary/50 hover:bg-primary/20 dark:hover:bg-primary/30 text-primary"
				),
			})}
			to="/dashboard/$slug/$lessonId"
			params={{ slug, lessonId: lesson.id }}
		>
			<div className="flex w-full min-w-0 items-center gap-2.5">
				<div className="shrink-0">
					{completed ? (
						<div className="flex size-6 items-center justify-center rounded-full bg-green-600 dark:bg-green-500">
							<IconCheck className="size-3 text-white" />
						</div>
					) : (
						<div
							className={cn(
								"bg-background flex size-5 items-center justify-center rounded-full",
								isActive
									? "border-primary bg-primary/10 dark:bg-primary/20"
									: "border-muted-foreground/60"
							)}
						>
							<IconPlayerPlay
								className={cn(
									"size-2.5 fill-current",
									isActive ? "text-primary" : "text-muted-foreground"
								)}
							/>
						</div>
					)}
				</div>

				<div className="min-w-0 flex-1 text-left">
					<p
						className={cn(
							"truncate text-xs font-medium",
							completed
								? "text-green-200 dark:text-green-800"
								: isActive
									? "text-primary font-semibold"
									: "text-foreground"
						)}
					>
						{lesson.position}. {lesson.title}
					</p>

					{completed && (
						<p className="text-[10px] font-medium text-green-700 dark:text-green-300">
							Completed
						</p>
					)}

					{isActive && !completed && (
						<p className="text-[10px] font-medium">Currently watching</p>
					)}
				</div>
			</div>
		</Link>
	);
};
