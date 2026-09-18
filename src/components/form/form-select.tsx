import { useFieldContext } from "#/hooks/form/use-form-context.ts";

import { Field, FieldError, FieldLabel } from "../ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

interface FormSelectProps<T> {
	getOptionLabel: (option: T) => string;
	getOptionValue: (option: T) => string;
	options: T[];
	label: string;
	placeholder: string;
}

const FormSelect = <T,>({
	getOptionLabel,
	getOptionValue,
	options,
	label,
	placeholder,
}: FormSelectProps<T>) => {
	const field = useFieldContext<T>();
	const errorMessage = field.state.meta.errors;
	const selectedValue = getOptionValue(field.state.value);

	return (
		<Field>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>

			<Select
				onValueChange={(value) => {
					if (value === null) {
						return;
					}

					const option = options.find((item) => getOptionValue(item) === value);
					if (option !== undefined) {
						field.handleChange(option);
					}
				}}
				value={selectedValue}
			>
				<SelectTrigger id={field.name}>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>

				<SelectContent>
					{options.map((option) => {
						const value = getOptionValue(option);

						return (
							<SelectItem key={value} value={value}>
								{getOptionLabel(option)}
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>

			<FieldError errors={errorMessage} />
		</Field>
	);
};

export default FormSelect;
