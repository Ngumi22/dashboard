import { NewProductSchemaServer } from "@/lib/ZodSchemas/productSchema";
import { RowDataPacket } from "mysql2/promise";
import sharp from "sharp";
import { z } from "zod";

export async function compressAndEncodeBase64(
  buffer: Buffer | null
): Promise<string | null> {
  if (!buffer) return null;

  try {
    const compressedBuffer = await sharp(buffer)
      .webp({ quality: 100 }) // Convert to WebP with 70% quality
      .toBuffer();

    return compressedBuffer.toString("base64");
  } catch (error) {
    console.error("Image compression error:", error);
    return null;
  }
}

export type ProductStatus = "draft" | "pending" | "approved";

// ImageFields interface for consistent reuse
export interface ImageFields {
  mainImage: Buffer | null;
  thumbnails: Buffer[];
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  price: number;
  quantity: number;
  discount: number;
  status: ProductStatus;
  tags?: string[];
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
    specification_id: string;
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
  ratings: number;
  created_at: string;
  updatedAt?: string;
}

// ProductRow extends RowDataPacket for direct MySQL query compatibility
export interface ProductRow extends RowDataPacket, ImageFields {
  product_id: string;
  name: string;
  sku: string;
  price: number;
  discount: number;
  quantity: number;
  category: string;
  status: ProductStatus;
  description: string;
  brand: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  thumbnail1: Buffer | null;
  thumbnail2: Buffer | null;
  thumbnail3: Buffer | null;
  thumbnail4: Buffer | null;
  thumbnail5: Buffer | null;
  main_image: Buffer | null; // Add this
  tagId?: string; // Add this if optional
  tagName?: string; // Add this if optional
  ratings: number;
  created_at: string;
}

export interface ProductResponse {
  id: string | number;
  name: string;
  sku: string;
  price: number;
  discount: number;
  quantity: number;
  ratings: number;
  category: string;
  status: ProductStatus;
  description: string;
  brand: string;
  createdAt: string;
  updatedAt: string;
  images: {
    mainImage: string | null;
    thumbnails: string[] | null;
  };
  tags?: string[];
  created_at: string;
}

// Define `SearchParams` interface with more explicit typing for query handling.
export interface SearchParams {
  productId?: string;
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  maxDiscount?: number;
  name?: string;
  brand?: string;
  category?: string;
  status?: string;
  quantity?: number;
  tags?: string;
  type?: "brand" | "category" | "default";
  minRating?: number;
  maxRating?: number;
  created_at?: string;
}

export async function mapProductRow(row: ProductRow): Promise<Product> {
  const compressAndEncode = async (image: Buffer | null) =>
    await compressAndEncodeBase64(image);

  const compressedMainImage = await compressAndEncode(row.main_image || null);
  const compressedthumbnail1 = await compressAndEncode(row.thumbnail1 || null);
  const compressedthumbnail2 = await compressAndEncode(row.thumbnail2 || null);
  const compressedthumbnail3 = await compressAndEncode(row.thumbnail3 || null);
  const compressedthumbnail4 = await compressAndEncode(row.thumbnail4 || null);
  const compressedthumbnail5 = await compressAndEncode(row.thumbnail5 || null);

  return {
    id: parseInt(row.product_id), // Ensure `id` is a number
    name: row.name,
    sku: row.sku,
    description: row.description,
    price: row.price,
    quantity: row.quantity,
    discount: row.discount,
    status: row.status as ProductStatus,
    tags: row.tags,
    main_image: compressedMainImage || "", // Ensure `main_image` is a string
    thumbnails: [
      {
        thumbnail1: compressedthumbnail1 || "",
        thumbnail2: compressedthumbnail2 || "",
        thumbnail3: compressedthumbnail3 || "",
        thumbnail4: compressedthumbnail4 || "",
        thumbnail5: compressedthumbnail5 || "",
      },
    ],
    category_id: row.category,
    brand: {
      brand_id: "", // You need to fetch this from your data
      brand_name: row.brand,
      brand_image: "", // You need to fetch this from your data
    },
    specifications: [], // You need to fetch this from your data
    suppliers: [], // You need to fetch this from your data
    ratings: 0,
    created_at: "",
  };
}

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
};

export type ParsedProductData = z.infer<typeof NewProductSchemaServer> & {
  category_id?: number;
  brand_id?: number;
  created_by?: number | null;
  updated_by?: number | null;
};

export interface Supplier {
  supplier_id: number;
  supplier_name: string;
  supplier_email: string;
  supplier_phone_number: string;
  supplier_location: string;
}

export interface Specification {
  specification_id: string;
  specification_name: string;
  specification_value: string;
  category_id: string;
}
