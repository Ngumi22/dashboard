import { z } from "zod";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const brandSchema = z.object({
  brand_name: z.string().min(1, "Brand name is required"),
  brand_image:
    typeof window === "undefined"
      ? z.any()
      : z
          .instanceof(File)
          .nullable()
          .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
            message: "File size must be less than 5MB",
          })
          .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
            message: "Invalid image type",
          }),
});
