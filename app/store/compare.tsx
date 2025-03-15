import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-toastify";

export type MinimalProduct = {
  id: number;
  name: string;
  description: string;
  price: number;
  discount: number;
  quantity: number;
  main_image: string;
  ratings: number;
  created_at?: string;
  category_name?: string;
  brand_name?: string;
  specifications?: {
    specification_id: string;
    specification_name: string;
    specification_value: string;
    category_id: string;
  }[];
  tags?: string[];
};

// Define the compare item type
type CompareItem = MinimalProduct & {
  quantity: number;
};

// Define the store state
export type CompareStoreState = {
  compareItems: CompareItem[];
  addItemToCompare: (product: MinimalProduct) => void;
  removeItemFromCompare: (id: number) => void;
  clearCompare: () => void;
  getTotalQuantity: () => number;
};

// Toast configuration for consistency
const showToast = (message: string, type: "success" | "error" = "success") => {
  toast[type](message, {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

// Create the store with Zustand and persist middleware
export const useCompareStore = create<CompareStoreState>()(
  persist(
    (set, get) => ({
      compareItems: [],

      // Add a product to the compare
      addItemToCompare: (product: MinimalProduct) => {
        if (!product || !product.id) {
          showToast("Invalid product. Please try again.", "error");
          return;
        }

        set((state) => {
          const existingItem = state.compareItems.find(
            (item) => item.id === product.id
          );

          // If the product already exists in the compare, increase its quantity
          if (existingItem) {
            const updatedCompareItems = state.compareItems.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
            showToast(`Added 1 more ${product.name} to your comparelist!`);
            return { compareItems: updatedCompareItems };
          }

          // If it's a new product, add it to the compare
          const updatedCompareItems = [
            ...state.compareItems,
            { ...product, quantity: 1 },
          ];
          showToast(`Added ${product.name} to your comparelist!`);
          return { compareItems: updatedCompareItems };
        });
      },

      // Remove a product from the compare
      removeItemFromCompare: (id: number) => {
        set((state) => {
          const updatedCompareItems = state.compareItems.filter(
            (item) => item.id !== id
          );
          if (updatedCompareItems.length !== state.compareItems.length) {
            showToast("Item removed from comparelist.");
          }
          return { compareItems: updatedCompareItems };
        });
      },

      // Clear the entire compare
      clearCompare: () => {
        set({ compareItems: [] });
        showToast("Comparelist cleared.");
      },

      // Get the total quantity of items in the compare
      getTotalQuantity: () => {
        const { compareItems } = get();
        return compareItems.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "compare-storage", // Name for localStorage persistence
    }
  )
);
