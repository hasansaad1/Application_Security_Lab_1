import { z } from "zod";

export const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least 1 lowercase letter.")
    .regex(/\d/, "Password must contain at least 1 number.")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 special character.");

export type PasswordRuleFlags = {
    length: boolean;
    upper: boolean;
    lower: boolean;
    number: boolean;
    special: boolean;
};

export function getPasswordRuleFlags(password: string): PasswordRuleFlags {
    return {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    };
}

// Signup schema
export const signupSchema = z
    .object({
        username: z.string().min(3, "Username must be at least 3 characters."),
        email: z.email("Please enter a valid email address."),
        password: passwordSchema,
        confirm_password: z.string(),
        phone_number: z.string().min(6, "Phone number is too short."),
    })
    .superRefine((data, ctx) => {
        if (data.password !== data.confirm_password) {
            ctx.addIssue({
                code: "custom",
                path: ["confirmPassword"],
                message: "Passwords do not match.",
            });
        }
    });

export type SignupValues = z.infer<typeof signupSchema>;

// Login schema
export const loginSchema = z.object({
    email: z.email("Please enter a valid email address."),
    password: z.string().min(1, "Password is required."),
});

export type LoginValues = z.infer<typeof loginSchema>;