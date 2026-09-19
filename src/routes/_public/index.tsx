// oxlint-disable react/function-component-definition func-style
import { createFileRoute, Link } from "@tanstack/react-router";

import { Badge } from "#/components/ui/badge.tsx";
import { buttonVariants } from "#/components/ui/button.tsx";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";

interface Feature {
	title: string;
	description: string;
	icon: string;
}

const features: Feature[] = [
	{
		title: "Comprehensive Courses",
		description:
			"Access a wide range of carefully curated courses designed by industry experts.",
		icon: "📚",
	},
	{
		title: "Interactive Learning",
		description:
			"Interact with content, quizzes and assignments to enhance your learning experience",
		icon: "🎮",
	},
	{
		title: "Progress Tracking",
		description:
			"Monitor your progress and achievements with detailed analytics and personalized dashboards.",
		icon: "📊",
	},
	{
		title: "Community Support",
		description:
			"Join a vibrant community of learners and instructors to collaborate and share knowledge",
		icon: "🧑🏽‍🤝‍🧑🏾",
	},
];

export const Route = createFileRoute("/_public/")({
	component: LandingPage,
});

function LandingPage() {
	return (
		<>
			<section className="relative py-20">
				<div className="flex flex-col items-center space-y-8 text-center">
					<Badge variant="outline">The Future of Online Education</Badge>

					<h1 className="text-4xl font-bold tracking-tight md:text-6xl">
						Elevate your Learning Experience
					</h1>

					<p className="text-muted-foreground max-w-175 md:text-xl">
						Discover a new way to learn with our mordern, interactive learning
						management system. Access high-quality courses anytime, anywhere.
					</p>

					<div className="mt-8 flex flex-col gap-4 sm:flex-row">
						<Link className={buttonVariants({ size: "lg" })} to="/courses">
							Explore Courses
						</Link>

						<Link
							className={buttonVariants({ size: "lg", variant: "outline" })}
							to="/login"
						>
							Sign in
						</Link>
					</div>
				</div>
			</section>

			<section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				{features.map((feature, index) => (
					<Card key={index} className="transition-shadow hover:shadow-lg">
						<CardHeader>
							<div className="mb-4 text-4xl">{feature.icon}</div>

							<CardTitle>{feature.title}</CardTitle>
						</CardHeader>

						<CardContent>
							<p className="text-muted-foreground">{feature.description}</p>
						</CardContent>
					</Card>
				))}
			</section>
		</>
	);
}
