// oxlint-disable react/function-component-definition func-style
import { createFileRoute } from "@tanstack/react-router";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "#/components/ui/tabs.tsx";
import { getCourse } from "#/features/courses/functions/index.ts";

import { CourseStructure } from "../-components/course-structure";
import { EditCourseForm } from "./-components/edit-course-form";

export const Route = createFileRoute("/_app/admin/courses/$courseId/edit/")({
	component: EditCoursePage,
	loader: ({ params }) => getCourse({ data: { id: params.courseId } }),
});

function EditCoursePage() {
	const course = Route.useLoaderData();

	return (
		<div>
			<h1 className="mb-8 text-3xl font-bold">
				Edit Course:{" "}
				<span className="text-primary underline">{course.title}</span>
			</h1>

			<Tabs defaultValue="basic-info">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="basic-info">Basic Info</TabsTrigger>
					<TabsTrigger value="course-structure">Course Structure</TabsTrigger>
				</TabsList>

				<TabsContent value="basic-info">
					<Card>
						<CardHeader>
							<CardTitle>Basic Info</CardTitle>
							<CardDescription>
								Provide basic information about the course
							</CardDescription>
						</CardHeader>

						<CardContent>
							<EditCourseForm course={course} />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="course-structure">
					<Card>
						<CardHeader>
							<CardTitle>Course Structure</CardTitle>
							<CardDescription>
								Here you can update your course structure
							</CardDescription>
						</CardHeader>

						<CardContent>
							<CourseStructure course={course} />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
