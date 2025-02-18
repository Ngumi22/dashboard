import {
  fetchProductByIdFromDb,
  fetchProductByName,
  fetchProducts,
} from "@/lib/actions/Product/fetch";
import { Product } from "@/lib/actions/Product/productTypes";
import { getCachedData, setCachedData } from "@/lib/utils";
import { StateCreator } from "zustand";

export interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
  productDetails: Product | null; // Added this
  fetchProductsState: (
    currentPage: number,
    filter: Record<string, any>
  ) => Promise<void>;
  fetchProductByIdState: (product_id: string) => Promise<Product | null>; // Return Product | null
  fetchProductBySlug: (productName: string) => Promise<Product | null>;
}

export const createProductSlice: StateCreator<ProductState> = (set, get) => ({
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
  productDetails: null,

  fetchProductsState: async (currentPage = 1, filter = {}) => {
    const cacheKey = `products_${currentPage}_${JSON.stringify(filter)}`;
    const cachedData = getCachedData<{ products: Product[] }>(cacheKey);

    if (cachedData) {
      // Prevent unnecessary state updates if the cached data is already present
      const { products } = get();
      if (JSON.stringify(products) !== JSON.stringify(cachedData)) {
        set({ products: cachedData.products, loading: false, error: null });
      }
      return;
    }

    // Prevent redundant API calls if already loading
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });

    try {
      const { products } = await fetchProducts(currentPage, filter);

      // Cache the fetched data
      setCachedData(cacheKey, { products }, { ttl: 16 * 60 });

      set({ products, loading: false, error: null });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error fetching products",
        loading: false,
      });
    }
  },

  fetchProductByIdState: async (product_id: string) => {
    const cacheKey = `product_${product_id}`;
    const cachedProduct = getCachedData<Product>(cacheKey);

    if (cachedProduct) {
      set({ selectedProduct: cachedProduct, loading: false, error: null });
      return cachedProduct;
    }

    set({ loading: true, error: null });

    try {
      const product = await fetchProductByIdFromDb(product_id);

      if (product) {
        // Cache the product with a TTL of 2 minutes
        setCachedData(cacheKey, product, { ttl: 2 * 60 });

        set({ selectedProduct: product, loading: false, error: null });
        return product;
      } else {
        set({
          selectedProduct: null,
          error: "Product not found",
          loading: false,
        });
        return null;
      }
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Error fetching product details",
        loading: false,
      });
      return null;
    }
  },

  fetchProductBySlug: async (productName: string) => {
    try {
      set({ loading: true });
      const product = await fetchProductByName(productName);
      set({
        productDetails: product,
        loading: false,
        error: null,
      });
      return product;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error fetching product",
        loading: false,
      });
      return null;
    }
  },
});
