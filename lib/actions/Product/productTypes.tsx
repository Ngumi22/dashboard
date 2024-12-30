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
      .resize(100) // Resize to 100px width
      .webp({ quality: 70 }) // Convert to WebP with 70% quality
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
  product_id: string;
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
  supplier: string[];
  specifications: any;
  createdAt: string;
  updatedAt: string;
  images: {
    mainImage: string | null; // Accept Base64-encoded strings
    thumbnail1: string | null;
    thumbnail2: string | null;
    thumbnail3: string | null;
    thumbnail4: string | null;
    thumbnail5: string | null;
  };
  tags?: string[];
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
  stock?: number;
  tags?: string;
  type?: "brand" | "category" | "default";
  minRating?: number;
  maxRating?: number;
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
    product_id: row.product_id,
    name: row.name,
    sku: row.sku,
    price: row.price,
    discount: row.discount,
    quantity: row.quantity,
    category: row.category,
    ratings: row.ratings,
    supplier: row.supplier, // Assuming supplier is a comma-separated string
    specifications: row.specifications,
    status: row.status as ProductStatus,
    description: row.description,
    brand: row.brand,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    images: {
      mainImage: compressedMainImage,
      thumbnail1: compressedthumbnail1,
      thumbnail2: compressedthumbnail2,
      thumbnail3: compressedthumbnail3,
      thumbnail4: compressedthumbnail4,
      thumbnail5: compressedthumbnail5,
    },
    tags: row.tags,
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
