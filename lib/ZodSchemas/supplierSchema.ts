import { z } from "zod";

export const supplierSchema = z.object({
  supplier_name: z.string().min(1, "Supplier name is required."),
  supplier_email: z.string().email("Invalid email address."),
  supplier_phone_number: z.string().optional(),
  supplier_location: z.string().optional(),
});
