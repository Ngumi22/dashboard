import { PER_PAGE_KEY } from "@/components/Client-Side/Products/product-view-context";

export type ProductStatus = "active" | "inactive" | "draft" | "archived";

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
  sort?: string;
  page?: number;
  perPage?: number;
  grid?: string;
  [key: string]: string | number | undefined;
}

// Parse search params from URL to strongly typed object
export function parseSearchParams(
  params: Record<string, string | string[] | undefined>
): SearchParams {
  // Get perPage from localStorage if available
  let perPage = 12;
  if (typeof window !== "undefined") {
    const savedPerPage = localStorage.getItem(PER_PAGE_KEY);
    if (savedPerPage) {
      perPage = Number(savedPerPage);
    }
  }

  return {
    productId: params.productId?.toString(),
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    minDiscount: params.minDiscount ? Number(params.minDiscount) : undefined,
    maxDiscount: params.maxDiscount ? Number(params.maxDiscount) : undefined,
    name: params.name?.toString(),
    brand: params.brand?.toString(),
    category: params.category?.toString(),
    status: params.status?.toString(),
    quantity: params.quantity ? Number(params.quantity) : undefined,
    tags: params.tags?.toString(),
    type: params.type as "brand" | "category" | "default" | undefined,
    minRating: params.minRating ? Number(params.minRating) : undefined,
    maxRating: params.maxRating ? Number(params.maxRating) : undefined,
    created_at: params.created_at?.toString(),
    sort: params.sort?.toString(),
    page: params.page ? Number(params.page) : 1,
    perPage,
    // We'll handle any specification filters dynamically
    ...Object.fromEntries(
      Object.entries(params)
        .filter(([key]) => key.startsWith("spec_"))
        .map(([key, value]) => [key, value?.toString()])
    ),
  };
}
