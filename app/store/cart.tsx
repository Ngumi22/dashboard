import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-toastify"; // Import react-toastify's toast method
import { Product } from "@/lib/actions/Product/productTypes";

export type MinimalProduct = {
  id: string;
  name: string;
  price: number;
  ratings: number;
  discount: number;
  description: string;
  quantity: number;
  main_image: string | null;
};

// Define the cart item type
type CartItem = MinimalProduct & {
  quantity: number;
};

// Define the store state
export type CartStoreState = {
  cartItems: CartItem[];
  addItemToCart: (product: MinimalProduct) => void;
  removeItemFromCart: (id: string) => void;
  clearCart: () => void;
  increaseItemQuantity: (id: string) => void;
  decreaseItemQuantity: (id: string) => void;
  getTotalCost: () => number;
  getTotalQuantity: () => number;
};

// Create the store with Zustand and persist middleware
export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      cartItems: [],

      addItemToCart: (product: MinimalProduct) =>
        set((state) => {
          if (!product || !product.id) {
            console.error("Invalid product passed to addItemToCart:", product);
            return state;
          }

          const existingItem = state.cartItems.find(
            (item) => item.id === product.id
          );

          // If the product already exists in the cart, increase its quantity
          if (existingItem) {
            const updatedCartItems = state.cartItems.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
            // Show toast notification when item is added
            toast.success(`Added 1 more ${product.name} to your cart!`);
            return { cartItems: updatedCartItems };
          }

          // If it's a new product, add it to the cart
          const updatedCartItems = [
            ...state.cartItems,
            { ...product, quantity: 1 },
          ];
          // Show toast notification when item is added
          toast.success(`Added ${product.name} to your cart!`);
          return { cartItems: updatedCartItems };
        }),

      // Remove a product from the cart
      removeItemFromCart: (id: string) =>
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== id),
        })),

      // Clear the entire cart
      clearCart: () => set({ cartItems: [] }),

      // Increase the quantity of a product
      increaseItemQuantity: (id: string) =>
        set((state) => {
          const updatedCartItems = state.cartItems.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
          );
          toast.success("Increased quantity!");
          return { cartItems: updatedCartItems };
        }),

      // Decrease the quantity of a product, removing it if quantity drops to 0
      decreaseItemQuantity: (id: string) =>
        set((state) => {
          const updatedCartItems = state.cartItems
            .map((item) =>
              item.id === id && item.quantity > 1
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
            .filter((item) => item.quantity > 0);

          if (updatedCartItems.length !== state.cartItems.length) {
            toast.success("Item removed from cart.");
          }

          return { cartItems: updatedCartItems };
        }),

      // Get the total cost of items in the cart
      getTotalCost: () => {
        const { cartItems } = get();
        return cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getTotalQuantity: () => {
        const { cartItems } = get();
        return cartItems.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
