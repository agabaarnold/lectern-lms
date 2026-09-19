import { useFieldContext } from "#/hooks/form/use-form-context.ts";

import { RichTextEditor } from "../rich-text/editor";
import { Field, FieldError, FieldLabel } from "../ui/field";

interface FormEditorProps {
	label: string;
}

const FormEditor = ({ label }: FormEditorProps) => {
	const field = useFieldContext<string>();
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<Field data-invalid={isInvalid}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>

			<RichTextEditor field={field} />

			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
};

export default FormEditor;
