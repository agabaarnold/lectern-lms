import { IconPlus } from "@tabler/icons-react";
import { revalidateLogic } from "@tanstack/react-form-start";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "react-hot-toast";

import { Button } from "#/components/ui/button.tsx";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog.tsx";
import { FieldGroup } from "#/components/ui/field.tsx";
import { createLesson } from "#/features/courses/functions/index.ts";
import { lessonSchema } from "#/features/courses/schema/index.ts";
import type { LessonInput } from "#/features/courses/schema/index.ts";
import { useAppForm } from "#/hooks/form/use-form.ts";
import { tryCatch } from "#/lib/try-catch.ts";

export const NewLessonDialog = ({
	courseId,
	chapterId,
}: {
	courseId: string;
	chapterId: string;
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();

	const defaultValues: LessonInput = { courseId, chapterId, name: "" };

	const form = useAppForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			const { error } = await tryCatch(createLesson({ data: value }));

			if (error) {
				toast.error(error.message ?? "Failed to create lesson");
				return;
			}

			toast.success("Lesson created successfully");
			form.reset();
			setIsOpen(false);
			await router.invalidate();
		},
		validationLogic: revalidateLogic({
			mode: "submit",
			modeAfterSubmission: "blur",
		}),
		validators: { onSubmit: lessonSchema },
	});

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogTrigger
				render={
					<Button size="sm" variant="outline">
						<IconPlus className="size-4" /> New Lesson
					</Button>
				}
			/>

			<DialogContent className="sm:max-w-106.25">
				<DialogHeader>
					<DialogTitle>Create new lesson</DialogTitle>
					<DialogDescription>
						What would you like to name your lesson?
					</DialogDescription>
				</DialogHeader>

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
									label="Name"
									placeholder="Lesson name"
									type="text"
								/>
							)}
						</form.AppField>

						<form.AppForm>
							<form.SubmitButton label="Save change" submitLabel="Saving" />
						</form.AppForm>
					</FieldGroup>
				</form>
			</DialogContent>
		</Dialog>
	);
};
