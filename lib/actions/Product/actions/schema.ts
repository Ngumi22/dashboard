import * as z from "zod";

export const NewProductSchema = z.object({
  product_id: z.number().optional(),
  product_name: z
    .string()
    .min(2, { message: "Name is required and must be at least 2 characters." }),
  product_sku: z
    .string()
    .min(2, { message: "SKU is required and must be at least 2 characters." }),
  product_description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters." }),
  long_description: z
    .string()
    .max(20000, { message: "Description must not exceed 20,000 characters." }),
  product_price: z.coerce.number().min(0, { message: "Mininmum price is 0" }),
  product_quantity: z.coerce
    .number()
    .min(0, { message: "Mininmum quantity is 0" }),
  product_discount: z.coerce
    .number()
    .min(0, { message: "Mininmum discount is 0" }),
  product_status: z.enum(["draft", "pending", "approved"]),
  tags: z.array(z.string()),
  brand_id: z.string().transform((val) => parseInt(val, 10)),
  thumbnails: z.array(
    z
      .custom<FileList>()
      .transform((val) => {
        if (val instanceof File) return val;
        if (val instanceof FileList) return val[0];
        return null;
      })
      .superRefine((file, ctx) => {
        if (!(file instanceof File)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            fatal: true,
            message: "Not a file",
          });

          return z.NEVER;
        }

        if (file.size > 5 * 1024 * 1024) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Max file size allowed is 5MB",
          });
        }

        if (
          !["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(
            file.type
          )
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "File must be an image (jpeg, jpg, png, webp)",
          });
        }
      })
      .pipe(z.custom<File>())
  ),
  brand_name: z.string().min(2, {
    message: "Brand name is required and must be at least 2 characters.",
  }),
  category_id: z.string(),
  main_image: z
    .custom<FileList>()
    .transform((val) => {
      if (val instanceof File) return val;
      if (val instanceof FileList) return val[0];
      return null;
    })
    .superRefine((file, ctx) => {
      if (!(file instanceof File)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          fatal: true,
          message: "Not a file",
        });

        return z.NEVER;
      }

      if (file.size > 5 * 1024 * 1024) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Max file size allowed is 5MB",
        });
      }

      if (
        !["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(
          file.type
        )
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "File must be an image (jpeg, jpg, png, webp)",
        });
      }
    })
    .pipe(z.custom<File>()),

  brand_image: z
    .custom<FileList>()
    .transform((val) => {
      if (val instanceof File) return val;
      if (val instanceof FileList) return val[0];
      return null;
    })
    .superRefine((file, ctx) => {
      if (!(file instanceof File)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          fatal: true,
          message: "Not a file",
        });

        return z.NEVER;
      }

      if (file.size > 5 * 1024 * 1024) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Max file size allowed is 5MB",
        });
      }

      if (
        !["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(
          file.type
        )
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "File must be an image (jpeg, jpg, png, webp)",
        });
      }
    })
    .pipe(z.custom<File>()),

  suppliers: z.array(
    z.object({
      supplier_id: z.number().int().positive().optional(),
      supplier_name: z.string().min(1, "Supplier name is required"),
      supplier_email: z.string().email("Invalid email").optional(),
      supplier_phone_number: z.string().optional(),
      supplier_location: z.string().optional(),
    })
  ),
  specifications: z.array(
    z.object({
      specification_name: z.string().min(1, "Specification name is required"),
      specification_value: z.string().min(1, "Specification value is required"),
    })
  ),
});

export const NewProductSchemaServer = z.object({
  product_id: z.coerce.number().optional(),
  product_name: z
    .string()
    .min(2, { message: "Name is required and must be at least 2 characters." }),
  product_sku: z
    .string()
    .min(2, { message: "SKU is required and must be at least 2 characters." }),
  product_description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters." }),
  long_description: z.string().optional().or(z.literal("")), // Allow empty string
  product_price: z.coerce.number().min(0, { message: "Mininmum price is 0" }),
  product_quantity: z.coerce
    .number()
    .min(0, { message: "Mininmum quantity is 0" }),
  product_discount: z.coerce
    .number()
    .min(0, { message: "Mininmum discount is 0" }),
  product_status: z.enum(["draft", "pending", "approved"]),
  tags: z.array(z.string()),
  brand_id: z.string().transform((val) => parseInt(val, 10)),
  thumbnails: z.array(
    z.unknown().transform((value) => {
      return value as FileList;
    })
  ),
  brand_name: z.string().min(2, {
    message: "Brand name is required and must be at least 2 characters.",
  }),

  category_id: z.string().transform((val) => parseInt(val, 10)),
  main_image: z.unknown().transform((value) => {
    return value as FileList;
  }),

  //thumbnails: z.array(z.custom<File>()).min(5, "Minimum 5 thumbnails required"),
  brand_image: z.unknown().transform((value) => {
    return value as FileList;
  }),

  suppliers: z.array(
    z.object({
      supplier_id: z.number().int().positive().optional(),
      supplier_name: z.string().min(1, "Supplier name is required"),
      supplier_email: z.string().email("Invalid email").optional(),
      supplier_phone_number: z.string().optional(),
      supplier_location: z.string().optional(),
    })
  ),
  specifications: z.array(
    z.object({
      specification_name: z.string().min(1, "Specification name is required"),
      specification_value: z.string().min(1, "Specification value is required"),
    })
  ),
});
