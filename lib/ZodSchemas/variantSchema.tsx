import { z } from "zod";

export const variantTypeSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Variant type name is required"),
  description: z.string().optional(),
});

export const variantSchema = z.object({
  id: z.number().optional(),
  variant_type_id: z.number().int().positive(),
  value: z.string().min(1, "Variant value is required"),
  price: z.number().min(0, "Price must be non-negative"),
  quantity: z.number().int().min(0, "Quantity must be non-negative"),
  status: z.enum(["active", "inactive"]),
  variant_image: z.instanceof(File).optional(),
  variant_thumbnail1: z.instanceof(File).optional(),
  variant_thumbnail2: z.instanceof(File).optional(),
});
