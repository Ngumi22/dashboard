import * as z from "zod";

export const variantFormSchema = z.object({
  variantId: z.number().optional(), // Optional for new variants
  productId: z.number().int().positive(),
  specificationId: z.number().int().positive(),
  value: z.string().min(1, "Value is required"),
  variantPrice: z.number().nonnegative(),
  variantQuantity: z.number().int().nonnegative(),
  variantStatus: z.enum(["active", "inactive"]),
  images: z.array(z.instanceof(File)).optional(),
});

export type VariantFormValues = z.infer<typeof variantFormSchema>;
