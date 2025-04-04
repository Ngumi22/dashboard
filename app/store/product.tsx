import {
  fetchProductById,
  fetchProductByName,
  fetchProducts,
} from "@/lib/actions/Product/fetch";
import { Product } from "@/lib/actions/Product/productTypes";
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
    // Prevent redundant API calls if already loading
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });

    try {
      const { products } = await fetchProducts(currentPage, filter);

      set({ products, loading: false, error: null });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error fetching products",
        loading: false,
      });
    }
  },

  fetchProductByIdState: async (product_id: string) => {
    set({ loading: true, error: null });

    try {
      const product = await fetchProductById(Number.parseInt(product_id));

      if (product) {
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
