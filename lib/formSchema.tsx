import { z } from "zod";

const MAX_FILE_SIZE = 5000000; // 5MB in bytes
const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Define Zod schema for validation
export const imageSchema = z.object({
  mainImage: z
    .instanceof(File)
    .nullable()
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB"
    )
    .refine(
      (file) =>
        !file || ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Invalid image type"
    ),
  thumbnails: z
    .array(
      z
        .instanceof(File)
        .refine(
          (file) => file.size <= 5 * 1024 * 1024,
          "File size must be less than 5MB"
        )
        .refine(
          (file) =>
            ["image/jpeg", "image/png", "image/webp"].includes(file.type),
          "Invalid image type"
        )
    )
    .max(5),
});

// Supplier schema
const contactInfoSchema = z
  .object({
    phone: z.string().optional(),
    address: z.string().optional(),
    email: z.string().email(),
  })
  .optional()
  .nullable();

export const supplierSchema = z
  .object({
    supplier: z
      .object({
        supplier_id: z.number().positive().optional(),
        name: z.string().min(1, "Name is required").optional(),
        contact_info: contactInfoSchema,
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
        contact_info: contactInfoSchema,
        created_by: z.number().nullable(),
        updated_by: z.number().nullable(),
      })
      .nullable()
      .optional(),
  })
  .refine(
    (data) => !(data.supplier && data.newSupplier),
    "Either select an existing supplier or add a new supplier, not both."
  );

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
    brandName: z.string().min(1, "Brand name is required"),
    brandImage:
      typeof window === "undefined"
        ? z.any()
        : z
            .instanceof(File)
            .nullable()
            .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
              message: "File size must be less than 5MB",
            })
            .refine(
              (file) => !file || ACCEPTED_IMAGE_MIME_TYPES.includes(file.type),
              {
                message: "Invalid image type",
              }
            ),
  }),
  category: z.object({
    categoryName: z.string().min(1, "Category name is required"),
    categoryDescription: z.string().min(1, "Category description is required"),
    categoryImage:
      typeof window === "undefined"
        ? z.any()
        : z
            .instanceof(File)
            .nullable()
            .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
              message: "File size must be less than 5MB",
            })
            .refine(
              (file) => !file || ACCEPTED_IMAGE_MIME_TYPES.includes(file.type),
              {
                message: "Invalid image type",
              }
            ),
  }),
  images: z.object({
    mainImage:
      typeof window === "undefined"
        ? z.any()
        : z
            .instanceof(FileList)
            .transform((fileList) => fileList[0])
            .nullable(),
    thumbnails: z.array(
      typeof window === "undefined"
        ? z.any()
        : z
            .instanceof(FileList)
            .transform((fileList) => fileList[0])
            .nullable()
    ),
  }),
});
