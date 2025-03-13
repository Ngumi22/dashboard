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

// Define the wish item type
type WishItem = MinimalProduct & {
  quantity: number;
};

// Define the store state
export type WishStoreState = {
  wishItems: WishItem[];
  addItemToWish: (product: MinimalProduct) => void;
  removeItemFromWish: (id: number) => void;
  clearWish: () => void;
  increaseItemQuantity: (id: number) => void;
  decreaseItemQuantity: (id: number) => void;
  getTotalCost: () => number;
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
export const useWishStore = create<WishStoreState>()(
  persist(
    (set, get) => ({
      wishItems: [],

      // Add a product to the wish
      addItemToWish: (product: MinimalProduct) => {
        if (!product || !product.id) {
          showToast("Invalid product. Please try again.", "error");
          return;
        }

        set((state) => {
          const existingItem = state.wishItems.find(
            (item) => item.id === product.id
          );

          // If the product already exists in the wish, increase its quantity
          if (existingItem) {
            const updatedWishItems = state.wishItems.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
            showToast(`Added 1 more ${product.name} to your wishlist!`);
            return { wishItems: updatedWishItems };
          }

          // If it's a new product, add it to the wish
          const updatedWishItems = [
            ...state.wishItems,
            { ...product, quantity: 1 },
          ];
          showToast(`Added ${product.name} to your wishlist!`);
          return { wishItems: updatedWishItems };
        });
      },

      // Remove a product from the wish
      removeItemFromWish: (id: number) => {
        set((state) => {
          const updatedWishItems = state.wishItems.filter(
            (item) => item.id !== id
          );
          if (updatedWishItems.length !== state.wishItems.length) {
            showToast("Item removed from wishlist.");
          }
          return { wishItems: updatedWishItems };
        });
      },

      // Clear the entire wish
      clearWish: () => {
        set({ wishItems: [] });
        showToast("Wishlist cleared.");
      },

      // Increase the quantity of a product
      increaseItemQuantity: (id: number) => {
        set((state) => {
          const updatedWishItems = state.wishItems.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
          );
          showToast("Increased quantity!");
          return { wishItems: updatedWishItems };
        });
      },

      // Decrease the quantity of a product, removing it if quantity drops to 0
      decreaseItemQuantity: (id: number) => {
        set((state) => {
          const updatedWishItems = state.wishItems
            .map((item) =>
              item.id === id && item.quantity > 1
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
            .filter((item) => item.quantity > 0);

          if (updatedWishItems.length !== state.wishItems.length) {
            showToast("Item removed from wish.");
          }

          return { wishItems: updatedWishItems };
        });
      },

      // Get the total cost of items in the wish
      getTotalCost: () => {
        const { wishItems } = get();
        return wishItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      // Get the total quantity of items in the wish
      getTotalQuantity: () => {
        const { wishItems } = get();
        return wishItems.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "wish-storage", // Name for localStorage persistence
    }
  )
);
