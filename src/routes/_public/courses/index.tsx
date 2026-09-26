// oxlint-disable react/function-component-definition func-style
import { Await, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { CourseSearchInput } from "#/components/shared/course-search-input.tsx";
import { getAllCourses } from "#/features/courses/functions/courses.ts";
import { matchesCourseQuery } from "#/lib/course-search.ts";

import { PublicCourseCard } from "../-components/public-course-card";
import { PublicCoursesLoadingGrid } from "../-components/public-courses-loading-grid";

export const Route = createFileRoute("/_public/courses/")({
	loader: () => ({ courses: getAllCourses() }),
	component: CoursesPage,
});

function CoursesPage() {
	const { courses } = Route.useLoaderData();
	const [query, setQuery] = useState("");

	return (
		<div className="mt-5">
			<div className="mb-10 flex flex-col space-y-4">
				<h1 className="text-3xl font-bold tracking-tight md:text-4xl">
					Explore Courses
				</h1>

				<p className="text-foreground">
					Discover our wide range of courses designed to help you achieve your
					learning goals
				</p>

				<CourseSearchInput value={query} onChange={setQuery} />
			</div>

			<Await fallback={<PublicCoursesLoadingGrid />} promise={courses}>
				{(resolvedCourses) => {
					const filteredCourses = resolvedCourses.filter((course) =>
						matchesCourseQuery(course, query)
					);

					if (filteredCourses.length === 0) {
						return (
							<p className="text-muted-foreground">
								No courses match &quot;{query.trim()}&quot;.
							</p>
						);
					}

					return (
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							{filteredCourses.map((course) => (
								<PublicCourseCard key={course.id} course={course} />
							))}
						</div>
					);
				}}
			</Await>
		</div>
	);
}
