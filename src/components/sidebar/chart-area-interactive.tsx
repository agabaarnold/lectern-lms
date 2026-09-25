// oxlint-disable shadcn/no-restyle react-doctor/prefer-dynamic-import
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "#/components/ui/chart.tsx";
import type { ChartConfig } from "#/components/ui/chart.tsx";

export const description = "An interactive area chart";

interface ChartAreaInteractiveProps {
	data: { date: string; enrollments: number }[];
}

const chartConfig = {
	enrollments: { label: "Enrollments", color: "var(--chart-1)" },
} satisfies ChartConfig;

export const ChartAreaInteractive = ({ data }: ChartAreaInteractiveProps) => {
	const totalEnrollments = useMemo(
		() => data.reduce((acc, curr) => acc + curr.enrollments, 0),
		[data]
	);

	return (
		<Card className="@container/card">
			<CardHeader>
				<CardTitle>Total Enrollments</CardTitle>
				<CardDescription>
					<span className="hidden @[540px]/card:block">
						Total enrollments for the last 30 days: {totalEnrollments}
					</span>

					<span className="@[540px]/card:hidden">
						Last 30 days: {totalEnrollments}
					</span>
				</CardDescription>
			</CardHeader>

			<CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-62.5 w-full"
				>
					<BarChart data={data} margin={{ left: 12, right: 12 }}>
						<CartesianGrid vertical={false} />

						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							interval="preserveStartEnd"
							tickFormatter={(value) => {
								const date = new Date(value);

								return date.toLocaleDateString("en-UG", {
									month: "short",
									day: "numeric",
								});
							}}
						/>

						<ChartTooltip
							content={
								<ChartTooltipContent
									className="w-37.5"
									labelFormatter={(value) => {
										const date = new Date(value);

										return date.toLocaleDateString("en-UG", {
											month: "short",
											day: "numeric",
										});
									}}
								/>
							}
						/>

						<Bar dataKey="enrollments" fill="var(--color-enrollments)" />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
};
