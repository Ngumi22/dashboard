import * as z from "zod";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// carouselSchema.ts

export const carouselSchema = z.object({
  title: z.string().min(1, "Title is required"),
  short_description: z.string().max(500).optional(),
  description: z.string().max(500).optional(),
  link: z.string().url().optional().default(""),
  image: z
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
  status: z.enum(["active", "inactive"]),
});

export type Carousel = z.infer<typeof carouselSchema>;
