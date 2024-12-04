import { RowDataPacket } from "mysql2/promise";

export interface ProductResponse {
  id: string | number;
  name: string;
  sku: string;
  price: number;
  discount: number;
  quantity: number;
  category: string;
  status: "approved" | "draft" | "pending";
  description: string;
  brand: string;
  createdAt: string;
  updatedAt: string;
  images: {
    mainImage: string | null;
    thumbnails: (string | null)[];
  };
  tags: string[];
}

export type ProductStatus = "draft" | "pending" | "approved";

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
}

// ImageFields interface for consistent reuse
export interface ImageFields {
  mainImage: Buffer | null;
  thumbnails: Buffer[];
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
  tags: string;
  thumbnail1: Buffer | null;
  thumbnail2: Buffer | null;
  thumbnail3: Buffer | null;
  thumbnail4: Buffer | null;
  thumbnail5: Buffer | null;
}

export interface Product {
  id: string;
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
  images: {
    mainImage: Buffer | null;
    thumbnails: Buffer[];
  };
  tags: string[];
}

// Mapping function to convert `ProductRow` to `Product`
export function mapProductRow(row: ProductRow): Product {
  return {
    id: row.product_id,
    name: row.name,
    sku: row.sku,
    price: row.price,
    discount: row.discount,
    quantity: row.quantity,
    category: row.category,
    status: row.status as ProductStatus,
    description: row.description,
    brand: row.brand,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    images: {
      mainImage: row.mainImage,
      thumbnails: [
        row.thumbnail1,
        row.thumbnail2,
        row.thumbnail3,
        row.thumbnail4,
        row.thumbnail5,
      ].filter((thumbnail): thumbnail is Buffer => thumbnail !== null),
    },
    tags: row.tags.split(",").map((tag) => tag.trim()),
  };
}
