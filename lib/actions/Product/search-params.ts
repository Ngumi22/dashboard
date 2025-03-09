export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  discount: number;
  tags?: string[];
  main_image: string;
  category_name: string;
  brand_name: string;
  specifications: {
    specification_id: string;
    specification_name: string;
    specification_value: string;
    category_id: string;
  }[];
  ratings: number;
  isNew?: boolean;
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
