import { Link } from "@tanstack/react-router";

import { useFieldContext } from "#/hooks/form/use-form-context.ts";

import { PasswordInput } from "../shared/password-input";
import { Field, FieldError, FieldLabel } from "../ui/field";

interface FormPasswordProps {
	isLogin?: boolean;
	label: string;
	placeholder: string;
}

const FormPassword = ({ label, placeholder, isLogin }: FormPasswordProps) => {
	const field = useFieldContext<string>();
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<Field data-invalid={isInvalid}>
			<div className="flex items-center justify-between">
				<FieldLabel htmlFor={field.name}>{label}</FieldLabel>

				{isLogin && (
					<Link
						className="hover:text-muted-foreground underline underline-offset-2"
						to="/forgot-password"
					>
						Forgot Password?
					</Link>
				)}
			</div>

			<PasswordInput
				aria-invalid={isInvalid}
				id={field.name}
				name={field.name}
				placeholder={placeholder}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				value={field.state.value}
			/>

			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
};

export default FormPassword;
