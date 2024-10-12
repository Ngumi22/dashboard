import * as z from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be a positive number"),
  discount: z.number().min(0, "Discount must be a positive number"),
  quantity: z.number().int().min(0, "Quantity must be a positive integer"),
  status: z.enum(["draft", "pending", "approved"]),
  category: z.object({
    id: z.number().int().positive().optional(),
    name: z.string().min(1, "Category name is required"),
    description: z.string().optional(),
    image: z.instanceof(File).optional(),
  }),
  brand: z.object({
    id: z.number().int().positive().optional(),
    name: z.string().min(1, "Brand name is required"),
    image: z.instanceof(File).optional(),
  }),
  suppliers: z.array(
    z.object({
      id: z.number().int().positive().optional(),
      name: z.string().min(1, "Supplier name is required"),
      email: z.string().email("Invalid email").optional(),
      phone_number: z.string().optional(),
      location: z.string().optional(),
    })
  ),
  specifications: z.array(
    z.object({
      name: z.string().min(1, "Specification name is required"),
      value: z.string().min(1, "Specification value is required"),
    })
  ),
  tags: z.array(z.string().min(1, "Tag is required")),
  variants: z.array(
    z.object({
      variant_type_id: z.number().int().positive("Variant type is required"),
      value: z.string().min(1, "Variant value is required"),
      price: z.number().min(0, "Variant price must be a positive number"),
      quantity: z
        .number()
        .int()
        .min(0, "Variant quantity must be a positive integer"),
      status: z.enum(["active", "inactive"]),
      images: z
        .array(z.instanceof(File))
        .max(6, "Maximum 6 images allowed for variant"),
    })
  ),
  main_image: z.instanceof(File).optional(),
  thumbnail_images: z
    .array(z.instanceof(File))
    .max(5, "Maximum 5 thumbnail images allowed"),
});
