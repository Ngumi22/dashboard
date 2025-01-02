import { create } from "zustand";
import { createBannerSlice, BannerState } from "./banners";
import { createCarouselSlice, CarouselState } from "./carousel";
import { createProductSlice, ProductState } from "./product";
import { CategoryState, createCategorySlice } from "./category";
import { useCartStore, CartStoreState } from "./cart";

// Combine the state types
type StoreState = BannerState & CarouselState & ProductState & CategoryState;

// Create the Zustand store
export const useStore = create<StoreState>((...a) => ({
  ...createBannerSlice(...a),
  ...createCarouselSlice(...a),
  ...createProductSlice(...a),
  ...createCategorySlice(...a),
}));
