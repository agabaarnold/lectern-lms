// oxlint-disable react/function-component-definition func-style
import { IconArrowLeft, IconSparkle } from "@tabler/icons-react";
import { revalidateLogic } from "@tanstack/react-form-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import slugify from "slugify";

import { Button, buttonVariants } from "#/components/ui/button.tsx";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";
import { FieldGroup } from "#/components/ui/field.tsx";
import {
	CourseCategories,
	courseLevels,
	courseSchema,
	courseStatus,
} from "#/features/courses/schema/index.ts";
import type { CourseInput } from "#/features/courses/schema/index.ts";
import { useAppForm } from "#/hooks/form/use-form.ts";

export const Route = createFileRoute("/_app/admin/courses/create/")({
	component: CreateCoursePage,
});

const defaultValues: CourseInput = {
	title: "",
	description: "",
	fileKey: "",
	price: 0,
	duration: 0,
	level: "Beginner",
	category: "Health & Fitness",
	status: "Draft",
	slug: "",
	smallDescription: "",
};

function CreateCoursePage() {
	const form = useAppForm({
		defaultValues,
		onSubmit: async ({ value }) => {},
		validationLogic: revalidateLogic({
			mode: "submit",
			modeAfterSubmission: "blur",
		}),
		validators: { onSubmit: courseSchema },
	});

	return (
		<>
			<div className="flex items-center gap-4">
				<Link
					className={buttonVariants({ size: "icon", variant: "outline" })}
					to="/admin/courses"
				>
					<IconArrowLeft />
				</Link>

				<h1 className="text-2xl font-bold">Create Courses</h1>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Basic Information</CardTitle>
					<CardDescription>
						Provide basic information about the course
					</CardDescription>
				</CardHeader>

				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<FieldGroup>
							<form.AppField name="title">
								{(field) => (
									<field.FormInput
										label="Title"
										placeholder="Enter the title"
										type="text"
									/>
								)}
							</form.AppField>

							<div className="flex items-end gap-4">
								<form.AppField name="slug">
									{(field) => (
										<field.FormInput
											label="Slug"
											placeholder="Enter the slug"
											type="text"
										/>
									)}
								</form.AppField>

								<Button
									className="w-fit"
									onClick={() => {
										const titleValue = form.getFieldValue("title");
										const slug = slugify(titleValue);

										form.setFieldValue("slug", slug, { dontValidate: false });
									}}
									type="button"
								>
									Generate Slug <IconSparkle size={16} className="ml-1" />
								</Button>
							</div>

							<form.AppField name="smallDescription">
								{(field) => (
									<field.FormTextarea
										className="min-h-30"
										label="Small Description"
										placeholder="Enter the small description"
									/>
								)}
							</form.AppField>

							<form.AppField name="fileKey">
								{(field) => (
									<field.FormInput
										label="Thumbnail image"
										placeholder="Thumbnail url"
										type="text"
									/>
								)}
							</form.AppField>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<form.AppField name="category">
									{(field) => (
										<field.FormSelect
											label="Category"
											placeholder="Select a category"
											options={[...CourseCategories]}
											getOptionLabel={(option) => option}
											getOptionValue={(option) => option}
										/>
									)}
								</form.AppField>

								<form.AppField name="level">
									{(field) => (
										<field.FormSelect
											label="Level"
											placeholder="Select a level"
											options={[...courseLevels]}
											getOptionLabel={(option) => option}
											getOptionValue={(option) => option}
										/>
									)}
								</form.AppField>

								<form.AppField name="duration">
									{(field) => (
										<field.FormNumber
											label="Duration (hours)"
											placeholder="Duration"
										/>
									)}
								</form.AppField>

								<form.AppField name="price">
									{(field) => (
										<field.FormNumber label="Price (UGX)" placeholder="Price" />
									)}
								</form.AppField>
							</div>

							<form.AppField name="status">
								{(field) => (
									<field.FormSelect
										label="Status"
										placeholder="Select a status"
										options={[...courseStatus]}
										getOptionLabel={(option) => option}
										getOptionValue={(option) => option}
									/>
								)}
							</form.AppField>

							<form.AppForm>
								<form.SubmitButton
									label="Create Course"
									submitLabel="Creating"
								/>
							</form.AppForm>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</>
	);
}
