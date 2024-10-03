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

export const supplierSchema = z
  .object({
    supplier: z
      .object({
        supplier_id: z.number().positive(), // Optionally include for existing suppliers
        name: z.string().min(1, "Name is required"),
        contact_info: z
          .object({
            phone: z.string().optional(),
            address: z.string().optional(),
            email: z.string().email(),
          })
          .nullable(), // or z.any() if more generic JSON structure is needed
        created_at: z.string().optional().nullable(), // Use appropriate date string format
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

// Product Schema
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
  status: z.enum(["draft", "pending", "approved"], {
    message: "Status is required.",
  }),
  tags: z
    .array(z.string().nonempty("Tags cannot be empty"))
    .optional()
    .refine(
      (tags) => {
        const uniqueTags = new Set(tags);
        return uniqueTags.size === tags?.length;
      },
      { message: "Tags must be unique" }
    ),
  supplier: supplierSchema,
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
  mainImage: z
    .any()
    .refine((files) => {
      return files?.[0]?.size <= MAX_FILE_SIZE;
    }, `Max image size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_MIME_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
  thumbnails: z.any(),
  specificationData: z
    .array(
      z.object({
        key: z.string().nonempty({ message: "Specification key is required." }),
        value: z
          .string()
          .nonempty({ message: "Specification value is required." }),
      })
    )
    .optional(),
});

// Schema for contact information
const contactInfoSchema = z.object({
  phone: z.string().nonempty("Phone is required"),
  address: z.string().nonempty("Address is required"),
  email: z.string().email("Invalid email"),
});
