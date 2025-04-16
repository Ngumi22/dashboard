import { z } from "zod";
import { NewProductSchemaServer } from "./schema";

// types/product.ts
export type ProductStatus = "draft" | "pending" | "approved";

export interface Product {
  // Core product information (required in all cases)
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  discount: number;
  main_image: string;
  ratings: number;

  // Optional fields (present in detailed view but not search results)
  sku?: string;
  long_description?: string;
  status?: ProductStatus;
  created_at?: string;
  updatedAt?: string;

  // Category information
  category_id?: string | number; // Can be string or number
  category_name?: string;

  // Brand information (flexible structure)
  brand?: {
    brand_id: string | number; // Can be string or number
    brand_name: string;
    brand_image?: string;
  };
  brand_name?: string; // Alternative flat structure
  brand_id?: string; // Can be string or number

  // Images
  thumbnails?: Array<{
    thumbnail1?: string;
    thumbnail2?: string;
    thumbnail3?: string;
    thumbnail4?: string;
    thumbnail5?: string;
  }>;

  // Tags
  tags?: string[];

  // Specifications
  specifications?: Array<{
    specification_id?: string;
    specification_name: string;
    specification_value: string;
    category_id?: string;
  }>;

  // Suppliers
  suppliers?: Array<{
    supplier_id?: number;
    supplier_name?: string;
    supplier_email?: string;
    supplier_phone_number?: string;
    supplier_location?: string;
    isNew?: boolean;
  }>;
}

// Helper type for product creation/update
export type ProductFormValues = z.infer<typeof NewProductSchemaServer>;
