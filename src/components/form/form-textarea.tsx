import { useFieldContext } from "#/hooks/form/use-form-context.ts";

import { Field, FieldError, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";

interface FormTextareaProps {
	label: string;
	placeholder: string;
	className?: React.ComponentProps<"textarea">["className"];
}

const FormTextarea = ({ label, placeholder, className }: FormTextareaProps) => {
	const field = useFieldContext<string>();
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<Field data-invalid={isInvalid}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>

			<Textarea
				aria-invalid={isInvalid}
				className={className}
				id={field.name}
				name={field.name}
				onBlur={(e) => {
					field.handleChange(e.target.value.trim());
					field.handleBlur();
				}}
				onChange={(e) => field.handleChange(e.target.value)}
				placeholder={placeholder}
				value={field.state.value}
			/>

			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
};

export default FormTextarea;
