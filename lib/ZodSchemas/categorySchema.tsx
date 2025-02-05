import { z } from "zod";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const CategorySchema = z.object({
  category_name: z.string().min(2, {
    message: "category name is required and must be at least 2 characters.",
  }),
  category_description: z.string().min(2, {
    message:
      "category Description is required and must be at least 2 characters.",
  }),
  parent_category_id: z.number().optional().nullable(), // Add parent_category_id
  category_status: z.enum(["active", "inactive"]),
  category_image: z
    .any()
    .optional()
    .refine(
      (file) => !file || file?.size <= MAX_FILE_SIZE,
      "Max file size is 100MB."
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .png, and .webp formats are supported."
    ),
  text_color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color")
    .default("#FFFFFF"),
  background_color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color")
    .default("#FFFFFF"),
});
