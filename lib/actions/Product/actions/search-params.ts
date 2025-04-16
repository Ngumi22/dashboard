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
  status?: "draft" | "pending" | "approved";
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

export interface SearchParams {
  id?: string;
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  maxDiscount?: number;
  name?: string;
  brand?: string | string[]; // Allow string or string[]
  category?: string | string[]; // Allow string or string[]
  quantity?: number;
  tags?: string[];
  specifications?: string[];
  minRating?: number;
  maxRating?: number;
  sort?: string;
  page?: number;
  perPage?: number;
  grid?: string;
  [key: string]: string | number | string[] | undefined;
}

export interface ProductsResponse {
  products: Product[];
  totalProducts: number;
  totalPages: number;
  filters: {
    categories: { id: string; name: string }[];
    brands: { id: string; name: string }[];
    specifications: { id: string; name: string; values: string[] }[];
    minPrice: number;
    maxPrice: number;
  };
  errorMessage?: string;
}
export function parseSearchParams(
  params: Record<string, string | string[] | undefined>
): SearchParams {
  return {
    minPrice:
      params.minPrice && !isNaN(Number(params.minPrice))
        ? Number(params.minPrice)
        : undefined,
    maxPrice:
      params.maxPrice && !isNaN(Number(params.maxPrice))
        ? Number(params.maxPrice)
        : undefined,
    minDiscount: params.minDiscount ? Number(params.minDiscount) : undefined,
    maxDiscount: params.maxDiscount ? Number(params.maxDiscount) : undefined,
    name: params.name?.toString(),
    brand: Array.isArray(params.brand)
      ? params.brand
      : params.brand?.toString(),
    category: Array.isArray(params.category)
      ? params.category
      : params.category?.toString(),
    quantity: params.quantity ? Number(params.quantity) : undefined,
    tags: Array.isArray(params.tags)
      ? params.tags
      : params.tags
        ? [params.tags]
        : undefined,
    minRating: params.minRating ? Number(params.minRating) : undefined,
    maxRating: params.maxRating ? Number(params.maxRating) : undefined,
    sort: params.sort?.toString(),
    page: params.page ? Number(params.page) : 1,
    specifications: Array.isArray(params.specifications)
      ? params.specifications
      : params.specifications
        ? [params.specifications]
        : undefined,
    ...Object.fromEntries(
      Object.entries(params)
        .filter(([key]) => key.startsWith("spec_"))
        .map(([key, value]) => [key, value?.toString()])
    ),
  };
}
