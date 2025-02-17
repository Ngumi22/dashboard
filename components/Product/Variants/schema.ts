import { z } from "zod";

export const variantFormSchema = z.object({
  variantId: z.number().optional(),
  productId: z.number().optional(),
  variantPrice: z.number().nonnegative("Price must be a non-negative number"),
  variantQuantity: z
    .number()
    .nonnegative("Quantity must be a non-negative number"),
  variantStatus: z.enum(["active", "inactive"]),
  specifications: z.array(
    z.object({
      specificationId: z.number(),
      value: z.string().min(1, "Value cannot be empty"),
    })
  ),
  images: z
    .array(
      z
        .instanceof(File)
        .refine(
          (file) => file.size <= 5 * 1024 * 1024,
          "File size must be 5MB or less"
        )
        .refine(
          (file) =>
            ["image/jpeg", "image/png", "image/webp"].includes(file.type),
          "Only JPG, PNG, and WEBP formats are allowed"
        )
    )
    .max(5, "You can upload up to 5 images"),
});

export type VariantFormValues = z.infer<typeof variantFormSchema>;
