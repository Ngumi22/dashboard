import { z } from "zod";

const MAX_FILE_SIZE = 5000000; // 5MB in bytes
const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// File validation schema
const fileSchema = z.custom<File>((file) => {
  if (!(file instanceof File)) {
    return false;
  }
  const validTypes = ACCEPTED_IMAGE_MIME_TYPES;
  if (!validTypes.includes(file.type)) {
    return false;
  }
  const maxSize = MAX_FILE_SIZE;
  if (file.size > maxSize) {
    return false;
  }
  return true;
}, "Invalid file. Must be jpg, jpeg, png, or webp and less than 5MB");

const imagesSchema = z.object({
  mainImage: fileSchema.optional(),
  thumbnails: z.record(fileSchema),
});

// Supplier schema
export const supplierSchema = z
  .object({
    supplier: z
      .object({
        supplier_id: z.number().positive().optional(),
        name: z.string().min(1, "Name is required").optional(),
        contact_info: z
          .object({
            phone: z.string().optional(),
            address: z.string().optional(),
            email: z.string().email(),
          })
          .optional()
          .nullable(),
        created_at: z.string().optional().nullable(),
        updated_at: z.string().optional().nullable(),
        deleted_at: z.string().optional().nullable(),
        created_by: z.number().optional().nullable(),
        updated_by: z.number().optional().nullable(),
      })
      .nullable()
      .optional(),
    newSupplier: z
      .object({
        name: z.string().min(1, "Name is required"),
        contact_info: z
          .object({
            phone: z.string().optional(),
            address: z.string().optional(),
            email: z.string().email(),
          })
          .optional()
          .nullable(),
        created_by: z.number().nullable(),
        updated_by: z.number().nullable(),
      })
      .nullable()
      .optional(),
  })
  .refine((data) => !(data.supplier && data.newSupplier), {
    message:
      "Either select an existing supplier or add a new supplier, not both.",
  });

// Main schema
export const schema = z.object({
  name: z
    .string()
    .min(2, { message: "Name is required and must be at least 2 characters." }),
  sku: z
    .string()
    .min(2, { message: "SKU is required and must be at least 2 characters." }),
  description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters." }),
  price: z.number(),
  quantity: z.number(),
  discount: z.number(),
  status: z.enum(["draft", "pending", "approved"]),
  tags: z.array(z.string()).optional(),
  supplier: supplierSchema.optional(),

  specificationData: z.any(),
  brand: z.object({
    brandName: z.string(),
    brandImage: fileSchema.nullable(),
  }),
  category: z.object({
    categoryName: z.string(),
    categoryDescription: z.string(),
    categoryImage: fileSchema.nullable(),
  }),
  images: z.object({
    mainImage: fileSchema.nullable(),
    thumbnails: z.array(fileSchema.nullable()),
  }),
});
