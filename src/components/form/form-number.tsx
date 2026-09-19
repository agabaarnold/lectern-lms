import { useFieldContext } from "#/hooks/form/use-form-context.ts";

import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

interface FormNumberProps {
	label: string;
	placeholder: string;
	min?: number;
	max?: number;
	step?: number | string;
	className?: React.ComponentProps<"input">["className"];
}

const FormNumber = ({
	label,
	placeholder,
	min,
	max,
	step,
	className,
}: FormNumberProps) => {
	const field = useFieldContext<number>();
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<Field data-invalid={isInvalid}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>

			<Input
				aria-invalid={isInvalid}
				className={className}
				id={field.name}
				max={max}
				min={min}
				name={field.name}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.valueAsNumber)}
				placeholder={placeholder}
				step={step}
				type="number"
				value={field.state.value}
			/>

			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
};

export default FormNumber;
