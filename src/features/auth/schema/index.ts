import { z } from "zod";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const NAME_MIN_LENGTH = 4;

const whiteSpaceRegex = /\s/u;

export const passwordSchema = z
	.string()
	.min(
		PASSWORD_MIN_LENGTH,
		`Password must be at least ${PASSWORD_MIN_LENGTH} characters`
	)
	.max(
		PASSWORD_MAX_LENGTH,
		`Password must not exceed ${PASSWORD_MAX_LENGTH} characters`
	)
	.regex(/[A-Z]/u, "Password must contain at least one uppercase letter")
	.regex(/[a-z]/u, "Password must contain at least one lowercase letter")
	.regex(/[0-9]/u, "Password must contain at least one number")
	.regex(
		/[^A-Za-z0-9\s]/u,
		"Password must contain at least one special character"
	)
	.refine((v) => !whiteSpaceRegex.test(v), "No spaces allowed");

export const loginSchema = z.object({
	email: z.email(),
	password: z.string().min(1, "Password is required"),
	rememberMe: z.boolean(),
});
export type LoginInput = z.input<typeof loginSchema>;

export const registerSchema = z.object({
	email: z.email(),
	name: z
		.string()
		.min(
			NAME_MIN_LENGTH,
			`Name must be at least ${NAME_MIN_LENGTH} characters`
		),
	password: passwordSchema,
});
export type RegisterInput = z.input<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
	email: z.email(),
});
export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>;

export const changeEmailSchema = z.object({
	newEmail: z.email(),
});
export type ChangeEmailInput = z.input<typeof changeEmailSchema>;

export const resetPasswordSchema = z
	.object({
		newPassword: passwordSchema,
		confirmPassword: passwordSchema,
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});
export type ResetPasswordInput = z.input<typeof resetPasswordSchema>;
