import { createFormHook } from "@tanstack/react-form-start";

import FormCheckbox from "#/components/form/form-checkbox.tsx";
import FormEditor from "#/components/form/form-editor.tsx";
import FormInput from "#/components/form/form-input.tsx";
import FormNumber from "#/components/form/form-number.tsx";
import FormPassword from "#/components/form/form-password.tsx";
import FormSelect from "#/components/form/form-select.tsx";
import FormTextarea from "#/components/form/form-textarea.tsx";
import SubmitButton from "#/components/form/submit-button.tsx";

import { fieldContext, formContext } from "./use-form-context";

export const { useAppForm } = createFormHook({
	fieldComponents: {
		FormInput,
		FormCheckbox,
		FormNumber,
		FormPassword,
		FormSelect,
		FormTextarea,
		FormEditor,
	},
	fieldContext,
	formComponents: { SubmitButton },
	formContext,
});
