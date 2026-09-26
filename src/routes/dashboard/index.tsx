// oxlint-disable react/function-component-definition func-style
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { ReactNode } from "react";

import { CourseSearchInput } from "#/components/shared/course-search-input.tsx";
import { getAllCourses } from "#/features/courses/functions/courses.ts";
import { getEnrolledCourses } from "#/features/courses/functions/enrollments.ts";
import { matchesCourseQuery } from "#/lib/course-search.ts";

import { PublicCourseCard } from "../_public/-components/public-course-card";
import { CourseProgressCard } from "./-components/course-progress-card";
import { CoursesEmptyState } from "./-components/courses-empty-state";

export const Route = createFileRoute("/dashboard/")({
	loader: async () => {
		const [allCourses, enrolledCourses] = await Promise.all([
			getAllCourses(),
			getEnrolledCourses(),
		]);

		return { allCourses, enrolledCourses };
	},
	component: DashboardPage,
});

function DashboardPage() {
	const { allCourses, enrolledCourses } = Route.useLoaderData();
	const [query, setQuery] = useState("");

	const availableCourses = allCourses.filter(
		(course) => !enrolledCourses.some((enrolled) => enrolled.id === course.id)
	);
	const filteredEnrolledCourses = enrolledCourses.filter((enrolled) =>
		matchesCourseQuery(enrolled.course, query)
	);
	const filteredAvailableCourses = availableCourses.filter((course) =>
		matchesCourseQuery(course, query)
	);

	let enrolledContent: ReactNode;
	if (enrolledCourses.length === 0) {
		enrolledContent = (
			<CoursesEmptyState
				buttonText="Browse courses"
				description="You haven't enrolled in any courses yet. Browse the catalog to find something to learn."
				href="/courses"
				title="No enrolled courses yet"
			/>
		);
	} else if (filteredEnrolledCourses.length === 0) {
		enrolledContent = (
			<p className="text-muted-foreground">
				No enrolled courses match &quot;{query.trim()}&quot;.
			</p>
		);
	} else {
		enrolledContent = (
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{filteredEnrolledCourses.map((course) => (
					<CourseProgressCard key={course.id} courses={course} />
				))}
			</div>
		);
	}

	let availableContent: ReactNode;
	if (availableCourses.length === 0) {
		availableContent = (
			<CoursesEmptyState
				buttonText="Browse courses"
				description="You have purchased every available course. Check back later for new releases."
				href="/courses"
				title="You've purchased all courses"
			/>
		);
	} else if (filteredAvailableCourses.length === 0) {
		availableContent = (
			<p className="text-muted-foreground">
				No available courses match &quot;{query.trim()}&quot;.
			</p>
		);
	} else {
		availableContent = (
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{filteredAvailableCourses.map((course) => (
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
						value={query}
						onChange={setQuery}
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
