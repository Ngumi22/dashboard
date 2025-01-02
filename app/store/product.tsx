import {
  fetchProductByIdFromDb,
  fetchProducts,
} from "@/lib/actions/Product/fetch";
import { getCachedData, setCachedData } from "@/lib/utils";
import { StateCreator } from "zustand";

export type ProductStatus = "draft" | "pending" | "approved";

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
    mainImage: string | null;
    thumbnail1: string | null;
    thumbnail2: string | null;
    thumbnail3: string | null;
    thumbnail4: string | null;
    thumbnail5: string | null;
  };
  tags?: string[];
}

export interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
  fetchProducts: (
    currentPage: number,
    filter: Record<string, any>
  ) => Promise<void>;
  fetchProductById: (product_id: string) => Promise<Product | null>; // Return Product | null
}

export const createProductSlice: StateCreator<ProductState> = (set, get) => ({
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,

  fetchProducts: async (currentPage = 1, filter = {}) => {
    const cacheKey = `products_${currentPage}_${JSON.stringify(filter)}`;
    const cachedData = getCachedData<{ products: Product[] }>(cacheKey);

    if (cachedData) {
      set({ products: cachedData.products, loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });

    try {
      const { products } = await fetchProducts(currentPage, filter);

      // Cache the fetched data
      setCachedData(cacheKey, { products }, { ttl: 6 * 60 });

      set({ products, loading: false, error: null });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error fetching products",
        loading: false,
      });
    }
  },

  fetchProductById: async (productId) => {
    const cacheKey = `product_${productId}`;
    const cachedProduct = getCachedData<Product>(cacheKey);

    if (cachedProduct) {
      set({ selectedProduct: cachedProduct, loading: false, error: null });
      return cachedProduct; // Return the cached product
    }

    set({ loading: true, error: null });

    try {
      const product = await fetchProductByIdFromDb(productId);

      if (product) {
        setCachedData(cacheKey, product, { ttl: 6 * 60 });
        set({ selectedProduct: product, loading: false, error: null });
        return product; // Return the fetched product
      } else {
        set({
          selectedProduct: null,
          error: "Product not found",
          loading: false,
        });
        return null; // Return null if not found
      }
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Error fetching product details",
        loading: false,
      });
      return null; // Return null in case of error
    }
  },
});
