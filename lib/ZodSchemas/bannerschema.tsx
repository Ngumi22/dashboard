import * as z from "zod";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// bannerSchema.ts

export const bannerSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().max(500).optional().default(""),
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
    context_type: z.enum(["existing", "new"]),
    usage_context_id: z.coerce.number().optional(), // Coerce to number
    new_context_name: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.context_type === "existing") {
        return !!data.usage_context_id;
      } else {
        return !!data.new_context_name;
      }
    },
    {
      message:
        "Please provide either an existing context ID or a new context name",
      path: ["context_type"],
    }
  );

export type Banner = z.infer<typeof bannerSchema>;
