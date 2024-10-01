import { z } from "zod";

const MAX_FILE_SIZE = 1024 * 1024 * 5;
const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Zod Schema
export const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  sku: z.string().min(2, {
    message: "SKU must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  price: z.number().positive({
    message: "Price must be a positive number greater than zero.",
  }),
  discount: z
    .number()
    .nonnegative({
      message: "Discount cannot be negative.",
    })
    .optional(),
  quantity: z.number().int().nonnegative({
    message: "Quantity cannot be negative.",
  }),
  status: z.enum(["draft", "pending", "approved"]),
  categoryId: z.number().int().nonnegative({
    message: "Category ID must be a non-negative integer.",
  }),
  brandId: z.number().int().nonnegative({
    message: "Brand ID must be a non-negative integer.",
  }),
  supplierId: z.number().int().nullable().optional(), // Assuming this can be null or not provided
  categoryName: z.string().min(2, {
    message: "Category must be at least 2 characters.",
  }),
  categoryDescription: z.string().min(2, {
    message: "Category must be at least 2 characters.",
  }),
  categoryImage: z
    .any()
    .refine((files) => {
      return files?.[0]?.size <= MAX_FILE_SIZE;
    }, `Max image size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_MIME_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
  brandName: z.string().min(2, {
    message: "Brand must be at least 2 characters.",
  }),
  brandImage: z
    .any()
    .refine((files) => {
      return files?.[0]?.size <= MAX_FILE_SIZE;
    }, `Max image size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_MIME_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
  tags: z.array(z.string()).optional(),
});

// Supplier Schema
export const supplierSchema = z.object({
  supplier: z.string().nullable(), // Existing supplier or null
  newSupplier: z
    .object({
      name: z.string().min(1, "Supplier name is required"),
      contact_info: z
        .object({
          phone: z.string().optional(),
          address: z.string().optional(),
        })
        .optional(),
      email: z.string().email("Invalid email format").optional(),
    })
    .optional(), // Optional to avoid being required when selecting an existing supplier
});

export const schema = z.object({
  name: z
    .string()
    .min(2, { message: "Name is required and must be at least 2 characters." }),
  sku: z
    .string()
    .min(2, { message: "SKU is required and must be at least 2 characters." }),
  description: z.string().min(5, {
    message: "Description is required and must be at least 5 characters.",
  }),

  price: z
    .string()
    .transform((value) => (value === "" ? "" : Number(value)))
    .refine((value) => !isNaN(Number(value)), {
      message: "Expected number, received string",
    }),
  quantity: z
    .string()
    .transform((value) => (value === "" ? "" : Number(value)))
    .refine((value) => !isNaN(Number(value)), {
      message: "Expected number, received string",
    }),
  discount: z
    .string()
    .transform((value) => (value === "" ? "" : Number(value)))
    .refine((value) => !isNaN(Number(value)), {
      message: "Expected number, received string",
    }),
  supplierId: z
    .string()
    .transform((value) => (value === "" ? null : value))
    .nullable() // Allow for null if no supplier is selected
    .refine((value) => value !== null || value === "", {
      message: "Supplier must be selected.",
    }),
  status: z.enum(["draft", "pending", "approved"], {
    message: "Status is required.",
  }),
});

// Combine Product and Supplier Schemas
export const combinedSchema = schema.extend({
  supplier: z.union([
    supplierSchema.optional(), // Use supplierSchema if existing supplier selected
    z.literal(null), // Allow null if no supplier selected
  ]),
});
