import { z } from "zod";

const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const signupFormSchema = z
  .object({
    first_name: z.string().min(2, {
      message: "First name must be at least 2 characters.",
    }),
    last_name: z.string().min(2, {
      message: "Last name must be at least 2 characters.",
    }),
    role: z.enum(["super_admin", "admin", "user", "manager"], {
      required_error: "Please select a role.",
    }),
    image: z
      .any()
      .refine((files) => files?.length == 1, "Image is required.")
      .refine(
        (files) => files?.[0]?.size <= MAX_FILE_SIZE,
        `Max file size is 5MB.`
      )
      .refine(
        (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
        ".jpg, .png and .webp files are accepted."
      )
      .optional(),

    email: z
      .string({
        required_error: "Please select an email to display.",
      })
      .email(),
    phone_number: z
      .string()
      .regex(phoneRegex, {
        message: "Please enter a valid phone number.",
      })
      .optional()
      .or(z.literal("")),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirm_password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords don't match",
        path: ["confirm_password"],
      });
    }
  });

export const serverSignupFormSchema = z
  .object({
    first_name: z.string().min(2, {
      message: "First name must be at least 2 characters.",
    }),
    last_name: z.string().min(2, {
      message: "Last name must be at least 2 characters.",
    }),
    role: z.enum(["super_admin", "admin", "user", "manager"], {
      required_error: "Please select a role.",
    }),
    image: z.unknown().transform((value) => {
      return value as FileList;
    }),

    email: z
      .string({
        required_error: "Please select an email to display.",
      })
      .email(),
    phone_number: z
      .string()
      .regex(phoneRegex, {
        message: "Please enter a valid phone number.",
      })
      .optional()
      .or(z.literal("")),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirm_password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords don't match",
        path: ["confirm_password"],
      });
    }
  });
