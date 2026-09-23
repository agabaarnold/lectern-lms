import { IconPlus } from "@tabler/icons-react";
import { revalidateLogic } from "@tanstack/react-form-start";
import { useState } from "react";

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
import { chapterSchema } from "#/features/courses/schema/index.ts";
import type { ChapterInput } from "#/features/courses/schema/index.ts";
import { useAppForm } from "#/hooks/form/use-form.ts";

export const NewChapterDialog = ({ courseId }: { courseId: string }) => {
	const [isOpen, setIsOpen] = useState(false);

	const defaultValues: ChapterInput = { courseId, name: "" };

	const form = useAppForm({
		defaultValues,
		validationLogic: revalidateLogic({
			mode: "submit",
			modeAfterSubmission: "blur",
		}),
		validators: { onSubmit: chapterSchema },
	});

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogTrigger
				render={
					<Button size="sm" variant="outline">
						<IconPlus className="size-4" /> New Chapter
					</Button>
				}
			/>

			<DialogContent className="sm:max-w-106.25">
				<DialogHeader>
					<DialogTitle>Create new chapter</DialogTitle>
					<DialogDescription>
						What would you like to name your chapter?
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
									placeholder="Chapter name"
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
