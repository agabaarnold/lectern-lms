// oxlint-disable react/function-component-definition func-style
import { Await, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

import { CourseSearchInput } from "#/components/shared/course-search-input.tsx";
import { getAllCourses } from "#/features/courses/functions/courses.ts";
import { useDebouncedCallback } from "#/hooks/use-debounced-callback.ts";

import { PublicCourseCard } from "../-components/public-course-card";
import { PublicCoursesLoadingGrid } from "../-components/public-courses-loading-grid";

export const Route = createFileRoute("/_public/courses/")({
	validateSearch: z.object({
		q: z.string().optional(),
	}),
	loaderDeps: ({ search }) => ({ q: search.q }),
	loader: ({ deps }) => ({ courses: getAllCourses({ data: { q: deps.q } }) }),
	component: CoursesPage,
});

function CoursesPage() {
	const { courses } = Route.useLoaderData();
	const search = Route.useSearch();
	const navigate = Route.useNavigate();

	const [value, setValue] = useState(search.q ?? "");

	const debouncedSearch = useDebouncedCallback((next: string) => {
		void navigate({
			search: (previous) => ({ ...previous, q: next.trim() || undefined }),
			replace: true,
		});
	}, 400);

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

				<CourseSearchInput
					value={value}
					onChange={(next) => {
						setValue(next);
						debouncedSearch(next);
					}}
				/>
			</div>

			<Await fallback={<PublicCoursesLoadingGrid />} promise={courses}>
				{(resolvedCourses) => {
					if (resolvedCourses.length === 0) {
						return (
							<p className="text-muted-foreground">
								{search.q
									? `No courses match "${search.q}".`
									: "No courses available yet."}
							</p>
						);
					}

					return (
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							{resolvedCourses.map((course) => (
								<PublicCourseCard key={course.id} course={course} />
							))}
						</div>
					);
				}}
			</Await>
		</div>
	);
}
