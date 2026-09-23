import { IconArrowLeft } from "@tabler/icons-react";
import { revalidateLogic } from "@tanstack/react-form-start";
import { Link } from "@tanstack/react-router";

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
import type { LessonInput } from "#/features/courses/schema/lessons.ts";
import { useAppForm } from "#/hooks/form/use-form.ts";

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
	const defaultValues: LessonInput = {
		name: lesson.title,
		chapterId,
		courseId,
		description: lesson.description ?? undefined,
		thumbnailKey: lesson.thumbnailKey ?? undefined,
		videoKey: lesson.videoKey ?? undefined,
	};

	const form = useAppForm({
		defaultValues,
		validationLogic: revalidateLogic({
			mode: "submit",
			modeAfterSubmission: "blur",
		}),
	});

	return (
		<div>
			<Link
				className={buttonVariants({ variant: "outline", className: "mb-6" })}
				to="/admin/courses/$courseId"
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
								{(field) => <field.FormEditor label="Desscription" />}
							</form.AppField>

							<form.AppField name="thumbnailKey">
								{(field) => <field.FormFileUploader label="Thumbnail image" fileType="image" />}
							</form.AppField>

							<form.AppField name="videoKey">
								{(field) => <field.FormFileUploader label="Video file" fileType="video" />}
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
