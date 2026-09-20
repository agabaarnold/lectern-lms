import { useFieldContext } from "#/hooks/form/use-form-context.ts";

import { Uploader } from "../file-uploader/uploader";
import { Field, FieldError, FieldLabel } from "../ui/field";

interface FormFileUploaderProps {
	label: string;
}

const FormFileUploader = ({ label }: FormFileUploaderProps) => {
	const field = useFieldContext<string>();
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<Field data-invalid={isInvalid}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>

			<Uploader
				onBlur={() => field.handleBlur()}
				onValueChange={(key) => field.handleChange(key)}
			/>

			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
};

export default FormFileUploader;
