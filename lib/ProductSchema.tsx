import * as z from "zod";

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

  status: z.enum(["draft", "pending", "approved"]),
});
