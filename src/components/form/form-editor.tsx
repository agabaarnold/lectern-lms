import { useFieldContext } from "#/hooks/form/use-form-context.ts";

import { RichTextEditor } from "../rich-text/editor";
import { Field, FieldLabel } from "../ui/field";

interface FormEditorProps {
	label: string;
}

const FormEditor = ({ label }: FormEditorProps) => {
	const field = useFieldContext<string>();

	return (
		<Field>
			<FieldLabel>{label}</FieldLabel>

			<RichTextEditor field={field} />
		</Field>
	);
};

export default FormEditor;
