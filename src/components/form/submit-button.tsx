import { useFormContext } from "#/hooks/form/use-form-context.ts";

import { Button } from "../ui/button";
import { Field } from "../ui/field";
import { Spinner } from "../ui/spinner";

interface SubmitButtonProps {
	label: string;
	submitLabel?: string;
	variant?: React.ComponentProps<typeof Button>["variant"];
}

const SubmitButton = ({
	label,
	submitLabel = "Submitting",
	variant = "default",
}: SubmitButtonProps) => {
	const form = useFormContext();

	return (
		<Field>
			<form.Subscribe
				selector={(state) => ({
					canSubmit: state.canSubmit,
					isSubmitting: state.isSubmitting,
				})}
			>
				{({ canSubmit, isSubmitting }) => (
					<Button
						disabled={isSubmitting || !canSubmit}
						type="submit"
						variant={variant}
					>
						{isSubmitting ? (
							<>
								<Spinner /> {submitLabel}...
							</>
						) : (
							label
						)}
					</Button>
				)}
			</form.Subscribe>
		</Field>
	);
};

export default SubmitButton;
