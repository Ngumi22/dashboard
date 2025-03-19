import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-toastify";

// Define the MinimalProduct type
export type MinimalProduct = {
  id: number;
  sku?: string;
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

// Define the CartItem type
type CartItem = MinimalProduct & {
  quantity: number;
};

// Define the store state
export type CartStoreState = {
  cartItems: CartItem[];
  addItemToCart: (product: MinimalProduct) => void;
  removeItemFromCart: (id: number) => void;
  clearCart: () => void;
  increaseItemQuantity: (id: number) => void;
  decreaseItemQuantity: (id: number) => void;
  getTotalCost: () => number;
  getTotalQuantity: () => number;
  updateItemQuantity: (id: number, quantity: number) => void;
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
export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      cartItems: [],

      // Add a product to the cart
      addItemToCart: (product: MinimalProduct) => {
        if (!product || !product.id || product.quantity <= 0) {
          showToast("Invalid product or quantity. Please try again.", "error");
          return;
        }

        set((state) => {
          const existingItem = state.cartItems.find(
            (item) => item.id === product.id
          );

          // If the product already exists in the cart, increase its quantity
          if (existingItem) {
            const updatedCartItems = state.cartItems.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + product.quantity }
                : item
            );
            showToast(
              `Added ${product.quantity} more ${product.name} to your cart!`
            );
            return { cartItems: updatedCartItems };
          }

          // If it's a new product, add it to the cart
          const updatedCartItems = [
            ...state.cartItems,
            { ...product, quantity: product.quantity },
          ];
          showToast(`Added ${product.quantity} ${product.name} to your cart!`);
          return { cartItems: updatedCartItems };
        });
      },

      removeItemFromCart: (id: number) => {
        set((state) => {
          const existingItem = state.cartItems.find((item) => item.id === id);
          if (!existingItem) {
            showToast("Item not found in cart.", "error");
            return state;
          }

          const updatedCartItems = state.cartItems.filter(
            (item) => item.id !== id
          );
          showToast("Item removed from cart.");
          return { cartItems: updatedCartItems };
        });
      },

      // Clear the entire cart
      clearCart: () => {
        set({ cartItems: [] });
        showToast("Cart cleared.");
      },

      // Increase the quantity of a product
      increaseItemQuantity: (id: number) => {
        set((state) => {
          const updatedCartItems = state.cartItems.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
          );
          showToast("Increased quantity!");
          return { cartItems: updatedCartItems };
        });
      },

      // Decrease the quantity of a product, removing it if quantity drops to 0
      decreaseItemQuantity: (id: number) => {
        set((state) => {
          const updatedCartItems = state.cartItems
            .map((item) =>
              item.id === id && item.quantity > 1
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
            .filter((item) => item.quantity > 0);

          if (updatedCartItems.length !== state.cartItems.length) {
            showToast("Item removed from cart.");
          }

          return { cartItems: updatedCartItems };
        });
      },

      // Get the total cost of items in the cart
      getTotalCost: () => {
        const { cartItems } = get();
        return cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      // Get the total quantity of items in the cart
      getTotalQuantity: () => {
        const { cartItems } = get();
        return cartItems.reduce((total, item) => total + item.quantity, 0);
      },

      // Update the quantity of a specific item
      updateItemQuantity: (id: number, quantity: number) => {
        if (quantity <= 0) {
          showToast("Quantity must be greater than 0.", "error");
          return;
        }

        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },
    }),
    {
      name: "cart-storage", // Name for localStorage persistence
    }
  )
);
