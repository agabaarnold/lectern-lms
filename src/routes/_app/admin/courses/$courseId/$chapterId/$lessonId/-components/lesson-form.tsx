import { IconArrowLeft } from "@tabler/icons-react";
import { revalidateLogic } from "@tanstack/react-form-start";
import { Link, useRouter } from "@tanstack/react-router";
import { toast } from "react-hot-toast";

import { buttonVariants } from "#/components/ui/button.tsx";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";
import { FieldGroup } from "#/components/ui/field.tsx";
import type { getLesson } from "#/features/courses/functions/lessons.ts";
import { updateLesson } from "#/features/courses/functions/lessons.ts";
import { updateLessonSchema } from "#/features/courses/schema/lessons.ts";
import type { UpdateLessonInput } from "#/features/courses/schema/lessons.ts";
import { useAppForm } from "#/hooks/form/use-form.ts";
import { tryCatch } from "#/lib/try-catch.ts";

interface LessonFormProps {
	lesson: Awaited<ReturnType<typeof getLesson>>;
	chapterId: string;
	courseId: string;
}

export const LessonForm = ({
	chapterId,
	courseId,
	lesson,
}: LessonFormProps) => {
	const router = useRouter();

	const defaultValues: UpdateLessonInput = {
		id: lesson.id,
		name: lesson.title,
		chapterId,
		courseId,
		description: lesson.description ?? undefined,
		thumbnailKey: lesson.thumbnailKey ?? undefined,
		videoKey: lesson.videoKey ?? undefined,
	};

	const form = useAppForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			const { error } = await tryCatch(updateLesson({ data: value }));

			if (error) {
				toast.error(error.message ?? "Failed to update lesson");
				return;
			}

			toast.success("Lesson updated successfully");
			await router.invalidate();
			router.navigate({ to: "/admin/courses/$courseId", params: { courseId } });
		},
		validationLogic: revalidateLogic({
			mode: "submit",
			modeAfterSubmission: "blur",
		}),
		validators: { onSubmit: updateLessonSchema },
	});

	return (
		<div>
			<Link
				className={buttonVariants({ variant: "outline", className: "mb-6" })}
				to="/admin/courses/$courseId/edit"
				params={{ courseId }}
			>
				<IconArrowLeft className="size-4" />
				Go back
			</Link>

			<Card>
				<CardHeader>
					<CardTitle>Lesson Configuration</CardTitle>
					<CardDescription>
						Configure the video and description for this lesson
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
							<form.AppField name="name">
								{(field) => (
									<field.FormInput
										label="Lesson name"
										placeholder="Lesson name"
										type="text"
									/>
								)}
							</form.AppField>

							<form.AppField name="description">
								{(field) => <field.FormEditor label="Description" />}
							</form.AppField>

							<form.AppField name="thumbnailKey">
								{(field) => (
									<field.FormFileUploader
										label="Thumbnail image"
										fileType="image"
									/>
								)}
							</form.AppField>

							<form.AppField name="videoKey">
								{(field) => (
									<field.FormFileUploader label="Video file" fileType="video" />
								)}
							</form.AppField>

							<form.AppForm>
								<form.SubmitButton label="Save lesson" submitLabel="Saving" />
							</form.AppForm>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};
