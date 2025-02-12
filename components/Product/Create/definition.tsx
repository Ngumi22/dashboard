import { z } from "zod";

export interface Product {
  product_id: number;
  product_name: string;
  product_sku: string;
  product_description: string;
  product_price: number;
  product_quantity: number;
  product_discount: number;
  product_status: "draft" | "pending" | "approved";
  tags: string[];
  main_image: string;
  thumbnails: {
    thumbnail1: string;
    thumbnail2: string;
    thumbnail3: string;
    thumbnail4: string;
    thumbnail5: string;
  }[];
  category_id: string;
  brand: {
    brand_id: string;
    brand_name: string;
    brand_image: string;
  };
  specifications: {
    specification_name: string;
    specification_value: string;
    category_id: string;
  }[];
  suppliers: {
    supplier_id?: number;
    supplier_name?: string;
    supplier_email?: string;
    supplier_phone_number?: string;
    supplier_location?: string;
    isNew?: boolean;
  }[];
}

export interface Supplier {
  supplier_id?: number;
  supplier_name?: string;
  supplier_email?: string;
  supplier_phone_number?: string;
  supplier_location?: string;
  isNew?: boolean;
}
export interface Category {
  category_id: string;
  category_name: string;
}

export interface Brand {
  brand_id: number;
  brand_name: string;
  brand_image: File | string | null;
}

export interface ProductFormProps {
  initialData?: Product;
}

// Zod schema with enhanced validation
export const formSchema = z.object({
  product_id: z.number().optional(),
  category_id: z.string(),
  product_name: z
    .string()
    .min(2, { message: "Name is required and must be at least 2 characters." }),
  product_sku: z
    .string()
    .min(2, { message: "SKU is required and must be at least 2 characters." }),
  product_description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters." }),
  product_price: z.coerce
    .number()
    .min(0, { message: "Minimum price is 0" })
    .max(10000, { message: "Maximum price is 10000" }),
  product_quantity: z.coerce
    .number()
    .min(0, { message: "Minimum quantity is 0" })
    .max(1000, { message: "Maximum quantity is 1000" }),
  product_discount: z.coerce
    .number()
    .min(0, { message: "Minimum discount is 0" })
    .max(100, { message: "Maximum discount is 100" }),
  product_status: z.enum(["draft", "pending", "approved"]),
  tags: z
    .array(z.string().min(1, "Tag cannot be empty"))
    .min(1, "At least one tag is required")
    .max(5, "Maximum of 5 tags allowed"),

  brand: z
    .object({
      brand_id: z.string(),
      brand_name: z.string().min(1, "Brand name is required").optional(),
      brand_image: z.union([z.instanceof(File), z.string().url()]).optional(),
    })
    .refine(
      (data) =>
        data.brand_id !== null ||
        (data.brand_name && data.brand_name.length > 0),
      {
        message: "Either select an existing brand or enter a new brand name",
        path: ["brand_name"],
      }
    ),

  main_image: z
    .union([
      z.instanceof(File),
      z.string().url({ message: "Invalid image URL" }),
    ])
    .optional(),
  thumbnails: z
    .array(
      z.union([
        z.instanceof(File),
        z.string().url({ message: "Invalid image URL" }),
      ])
    )
    .max(5, "Maximum 5 thumbnails allowed")
    .optional(),
  specifications: z.array(
    z.object({
      specification_name: z.string(),
      specification_value: z.string(),
      category_id: z.string(),
    })
  ),
  suppliers: z.array(
    z.object({
      supplier_id: z.number().optional(),
      supplier_name: z.string().optional(),
      supplier_email: z.string().email().optional(),
      supplier_phone_number: z.string().optional(),
      supplier_location: z.string().optional(),
      isNew: z.boolean().optional(),
    })
  ),
});
export type ProductFormValues = z.infer<typeof formSchema>;
