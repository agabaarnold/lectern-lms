import { useFieldContext } from "#/hooks/form/use-form-context.ts";

import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

interface FormInputProps {
	label: string;
	placeholder: string;
	type: Exclude<
		React.ComponentProps<"input">["type"],
		"password" | "checkbox" | "number"
	>;
	className?: React.ComponentProps<"input">["className"];
}

const FormInput = ({ label, placeholder, type, className }: FormInputProps) => {
	const field = useFieldContext<string>();
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<Field data-invalid={isInvalid}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>

			<Input
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
				type={type}
				value={field.state.value}
			/>

			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
};

export default FormInput;
