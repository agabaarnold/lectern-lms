// oxlint-disable react/function-component-definition func-style
import { createFileRoute } from "@tanstack/react-router";

import { getAllCourses } from "#/features/courses/functions/courses.ts";
import { getEnrolledCourses } from "#/features/courses/functions/enrollments.ts";

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

	return (
		<>
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold">Enrolled Courses</h1>

				<p className="text-muted-foreground">
					Here you can see all the courses you have access to.
				</p>
			</div>

			{enrolledCourses.length === 0 ? (
				<CoursesEmptyState
					buttonText="Browse courses"
					description="You haven't enrolled in any courses yet. Browse the catalog to find something to learn."
					href="/courses"
					title="No enrolled courses yet"
				/>
			) : (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					{enrolledCourses.map((course) => (
						<CourseProgressCard key={course.id} courses={course} />
					))}
				</div>
			)}

			<section className="mt-10">
				<div className="mb-5 flex flex-col gap-2">
					<h1 className="text-3xl font-bold">Available Courses</h1>

					<p className="text-muted-foreground">
						Here you can see all the courses you can purchase.
					</p>
				</div>

				{allCourses.filter(
					(course) =>
						!enrolledCourses.some((enrolled) => enrolled.id === course.id)
				).length === 0 ? (
					<CoursesEmptyState
						buttonText="Browse courses"
						description="You have purchased every available course. Check back later for new releases."
						href="/courses"
						title="You've purchased all courses"
					/>
				) : (
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						{(() => {
							const cards: React.ReactNode[] = [];

							for (const course of allCourses) {
								if (
									!enrolledCourses.some((enrolled) => enrolled.id === course.id)
								) {
									cards.push(
										<PublicCourseCard key={course.id} course={course} />
									);
								}
							}

							return cards;
						})()}
					</div>
				)}
			</section>
		</>
	);
}
