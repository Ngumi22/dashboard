import * as z from "zod";

const MAX_FILE_SIZE = 500000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const NewProductSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name is required and must be at least 2 characters." }),
  sku: z
    .string()
    .min(2, { message: "SKU is required and must be at least 2 characters." }),
  description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters." }),
  price: z.coerce.number().min(0, { message: "Mininmum price is 0" }),
  quantity: z.coerce.number().min(0, { message: "Mininmum quantity is 0" }),
  discount: z.coerce.number().min(0, { message: "Mininmum discount is 0" }),
  status: z.enum(["draft", "pending", "approved"]),
  tags: z.string(),
  brandName: z.string().min(2, {
    message: "Brand name is required and must be at least 2 characters.",
  }),
  mainImage: z
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

  thumbnails: z.array(z.custom<File>()).min(5, "Minimum 5 thumbnails required"),
  brandImage: z
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
  categoryName: z.string().min(2, {
    message: "category name is required and must be at least 2 characters.",
  }),
  categoryDescription: z.string().min(2, {
    message:
      "category Description is required and must be at least 2 characters.",
  }),
  categoryImage: z
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
});
