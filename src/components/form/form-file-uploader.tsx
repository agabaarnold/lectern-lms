import { useFieldContext } from "#/hooks/form/use-form-context.ts";

import { Uploader } from "../file-uploader/uploader";
import { Field, FieldLabel } from "../ui/field";

interface FormFileUploaderProps {
	label: string;
}

const FormFileUploader = ({ label }: FormFileUploaderProps) => {
	const field = useFieldContext();

	return (
		<Field>
			<FieldLabel>{label}</FieldLabel>
            
			<Uploader />
		</Field>
	);
};

export default FormFileUploader;
