// oxlint-disable anti-slop/require-safety-comment-for-type-assertion
import { IconSparkle } from "@tabler/icons-react";
import { revalidateLogic } from "@tanstack/react-form-start";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useTransition } from "react";
import { toast } from "react-hot-toast";
import slugify from "slugify";

import { Badge } from "#/components/ui/badge.tsx";
import { Button } from "#/components/ui/button.tsx";
import { FieldGroup } from "#/components/ui/field.tsx";
import type { getCourse } from "#/features/courses/functions/courses.ts";
import {
	publishCourse,
	unpublishCourse,
	updateCourse,
} from "#/features/courses/functions/courses.ts";
import {
	CourseCategories,
	courseLevels,
	updateCourseSchema,
} from "#/features/courses/schema/courses.ts";
import type { UpdateCourseInput } from "#/features/courses/schema/courses.ts";
import { useAppForm } from "#/hooks/form/use-form.ts";
import { tryCatch } from "#/lib/try-catch.ts";

interface EditCourseFormProps {
	course: Awaited<ReturnType<typeof getCourse>>;
}

export const EditCourseForm = ({ course }: EditCourseFormProps) => {
	const navigate = useNavigate();
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const defaultValues: UpdateCourseInput = {
		id: course.id,
		title: course.title,
		description: course.description,
		fileKey: course.fileKey,
		price: course.price,
		duration: course.duration,
		level: course.level as UpdateCourseInput["level"],
		category: course.category as UpdateCourseInput["category"],
		slug: course.slug,
		smallDescription: course.smallDescription,
	};

	const form = useAppForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			const { error } = await tryCatch(updateCourse({ data: { ...value } }));

			if (error) {
				return toast.error(
					error.message ?? "An unexpected error occurred. Please try again"
				);
			}

			toast.success("Course updated successfully");
			navigate({ to: "/admin/courses" });
		},
		validationLogic: revalidateLogic({
			mode: "submit",
			modeAfterSubmission: "blur",
		}),
		validators: { onSubmit: updateCourseSchema },
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<FieldGroup>
				<div className="flex items-center justify-between">
					<Badge
						variant={course.status === "Published" ? "default" : "secondary"}
					>
						{course.status}
					</Badge>

					{course.status === "Published" ? (
						<Button
							disabled={isPending}
							onClick={() => {
								startTransition(async () => {
									const { error } = await tryCatch(
										unpublishCourse({ data: { id: course.id } })
									);

									if (error) {
										toast.error(error.message ?? "Failed to unpublish course");
										return;
									}

									toast.success("Course unpublished");
									await router.invalidate();
								});
							}}
							type="button"
							variant="outline"
						>
							Unpublish
						</Button>
					) : (
						<Button
							disabled={isPending}
							onClick={() => {
								startTransition(async () => {
									const { error } = await tryCatch(
										publishCourse({ data: { id: course.id } })
									);

									if (error) {
										toast.error(error.message ?? "Failed to publish course");
										return;
									}

									toast.success("Course published");
									await router.invalidate();
								});
							}}
							type="button"
						>
							Publish
						</Button>
					)}
				</div>

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
							const titleValue = form.getFieldValue("title") ?? "";
							const slug = slugify(titleValue, {
								lower: true,
								strict: true,
								trim: true,
							});

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

				<form.AppField name="description">
					{(field) => <field.FormEditor label="Description" />}
				</form.AppField>

				<form.AppField name="fileKey">
					{(field) => (
						<field.FormFileUploader fileType="image" label="Thumbnail image" />
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

				<form.AppForm>
					<form.SubmitButton label="Edit Course" submitLabel="Editing" />
				</form.AppForm>
			</FieldGroup>
		</form>
	);
};
