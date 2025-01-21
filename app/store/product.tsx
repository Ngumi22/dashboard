import { Product } from "@/components/Data-Table/types";
import { Supplier } from "@/components/Product/Create/types";
import { handleDeleteAction } from "@/lib/actions/Product/delete";
import {
  fetchProductByIdFromDb,
  fetchProducts,
} from "@/lib/actions/Product/fetch";
import { clearCachedData } from "@/lib/cache";
import { getCachedData, setCachedData } from "@/lib/utils";
import { StateCreator } from "zustand";

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
  deleteProductState: (product_id: string) => void;
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

  fetchProductById: async (product_id) => {
    const cacheKey = `product_${product_id}`;
    const cachedProduct = getCachedData<Product>(cacheKey);

    if (cachedProduct) {
      set({ selectedProduct: cachedProduct, loading: false, error: null });
      return cachedProduct; // Return the cached product
    }

    set({ loading: true, error: null });

    try {
      const product = await fetchProductByIdFromDb(product_id);

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

  deleteProductState: async (
    product_id: string,
    currentPage = 1,
    filter = {}
  ) => {
    const originalProducts = get().products;

    // Optimistically update the state to remove the product
    const updatedProducts = originalProducts.filter(
      (product) => product.product_id !== product_id
    );
    set({ products: updatedProducts, loading: true });

    try {
      const productCacheKey = `product_${product_id}`;
      const cacheKey = `products_${currentPage}_${JSON.stringify(filter)}`;

      // Call the server action to delete the product
      await handleDeleteAction(Number(product_id));

      // Clear the cached data
      clearCachedData(cacheKey);
      clearCachedData(productCacheKey);
      // Check if cached data for the current page exists
      const cachedProducts: Product[] | null = getCachedData(cacheKey);

      if (cachedProducts) {
        // Update the cached products list locally
        const updatedCache = cachedProducts.filter(
          (product) => product.product_id !== product_id
        );
        setCachedData(cacheKey, updatedCache, { ttl: 2 * 60 });
      } else {
        // If no cache is available, refetch data for the current page
        const { products: freshData }: { products: Product[] } =
          await fetchProducts(currentPage, filter);

        // Update the cache and state with the fresh data
        setCachedData(cacheKey, freshData, { ttl: 2 * 60 });
        set({ products: freshData });
      }

      set({ loading: false, error: null });
      return { success: true };
    } catch (err) {
      // Revert the optimistic update if an error occurs
      set({
        products: originalProducts,
        error: err instanceof Error ? err.message : "Error deleting product",
        loading: false,
      });

      return { success: false };
    }
  },
});
