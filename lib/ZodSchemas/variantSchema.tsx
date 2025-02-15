import { z } from "zod";

// Zod schema for variant validation
export const VariantSchema = z.object({
  variant_id: z.number().optional(), // Optional for new variants
  product_id: z.string().min(1, "Product ID is required"),
  specification_id: z.number().min(1, "Specification ID is required"),
  value: z.string().min(1, "Variant value is required"),
  variant_price: z.number().min(0, "Price must be a positive number"),
  variant_quantity: z.number().min(0, "Quantity must be a positive number"),
  variant_status: z.enum(["active", "inactive"]).default("active"),
  images: z
    .array(
      z.object({
        image_data: z.string().min(1, "Image data is required"), // Base64-encoded image
        image_type: z.enum(["full", "thumbnail"]).default("full"),
      })
    )
    .optional(), // Optional array of images
});

// Type for the form data
export type VariantFormValues = z.infer<typeof VariantSchema>;
