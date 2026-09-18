import { createFormHook } from "@tanstack/react-form-start";

import FormCheckbox from "#/components/form/form-checkbox.tsx";
import FormInput from "#/components/form/form-input.tsx";
import FormPassword from "#/components/form/form-password.tsx";
import FormSelect from "#/components/form/form-select.tsx";
import SubmitButton from "#/components/form/submit-button.tsx";

import { fieldContext, formContext } from "./use-form-context";

export const { useAppForm } = createFormHook({
	fieldComponents: { FormInput, FormCheckbox, FormPassword, FormSelect },
	fieldContext,
	formComponents: { SubmitButton },
	formContext,
});
