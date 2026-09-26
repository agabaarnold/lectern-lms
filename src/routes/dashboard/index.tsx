// oxlint-disable react/function-component-definition func-style
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { ReactNode } from "react";
import { z } from "zod";

import { CourseSearchInput } from "#/components/shared/course-search-input.tsx";
import { getAllCourses } from "#/features/courses/functions/courses.ts";
import { getEnrolledCourses } from "#/features/courses/functions/enrollments.ts";
import { useDebouncedCallback } from "#/hooks/use-debounced-callback.ts";

import { PublicCourseCard } from "../_public/-components/public-course-card";
import { CourseProgressCard } from "./-components/course-progress-card";
import { CoursesEmptyState } from "./-components/courses-empty-state";

export const Route = createFileRoute("/dashboard/")({
	validateSearch: z.object({
		q: z.string().optional(),
	}),
	loaderDeps: ({ search }) => ({ q: search.q }),
	loader: async ({ deps }) => {
		const [allCourses, enrolledCourses] = await Promise.all([
			getAllCourses({ data: { q: deps.q } }),
			getEnrolledCourses({ data: { q: deps.q } }),
		]);

		return { allCourses, enrolledCourses };
	},
	component: DashboardPage,
});

function DashboardPage() {
	const { allCourses, enrolledCourses } = Route.useLoaderData();
	const search = Route.useSearch();
	const navigate = Route.useNavigate();

	const [value, setValue] = useState(search.q ?? "");

	const debouncedSearch = useDebouncedCallback((next: string) => {
		void navigate({
			search: (previous) => ({ ...previous, q: next.trim() || undefined }),
			replace: true,
		});
	}, 400);

	const availableCourses = allCourses.filter(
		(course) => !enrolledCourses.some((enrolled) => enrolled.id === course.id)
	);

	const hasQuery = (search.q ?? "").trim() !== "";

	let enrolledContent: ReactNode;
	if (enrolledCourses.length === 0 && !hasQuery) {
		enrolledContent = (
			<CoursesEmptyState
				buttonText="Browse courses"
				description="You haven't enrolled in any courses yet. Browse the catalog to find something to learn."
				href="/courses"
				title="No enrolled courses yet"
			/>
		);
	} else if (enrolledCourses.length === 0) {
		enrolledContent = (
			<p className="text-muted-foreground">
				No enrolled courses match &quot;{search.q?.trim()}&quot;.
			</p>
		);
	} else {
		enrolledContent = (
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{enrolledCourses.map((course) => (
					<CourseProgressCard key={course.id} courses={course} />
				))}
			</div>
		);
	}

	let availableContent: ReactNode;
	if (availableCourses.length === 0 && !hasQuery) {
		availableContent = (
			<CoursesEmptyState
				buttonText="Browse courses"
				description="You have purchased every available course. Check back later for new releases."
				href="/courses"
				title="You've purchased all courses"
			/>
		);
	} else if (availableCourses.length === 0) {
		availableContent = (
			<p className="text-muted-foreground">
				No available courses match &quot;{search.q?.trim()}&quot;.
			</p>
		);
	} else {
		availableContent = (
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{availableCourses.map((course) => (
					<PublicCourseCard key={course.id} course={course} />
				))}
			</div>
		);
	}

	return (
		<>
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold">Enrolled Courses</h1>

				<p className="text-muted-foreground">
					Here you can see all the courses you have access to.
				</p>

				<div className="mt-2">
					<CourseSearchInput
						id="dashboard-course-search"
						value={value}
						onChange={(next) => {
							setValue(next);
							debouncedSearch(next);
						}}
					/>
				</div>
			</div>

			{enrolledContent}

			<section className="mt-10">
				<div className="mb-5 flex flex-col gap-2">
					<h1 className="text-3xl font-bold">Available Courses</h1>

					<p className="text-muted-foreground">
						Here you can see all the courses you can purchase.
					</p>
				</div>

				{availableContent}
			</section>
		</>
	);
}
