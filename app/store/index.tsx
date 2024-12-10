import { create } from "zustand";
import { createBannerSlice, BannerState } from "./banners";
import { createCarouselSlice, CarouselState } from "./carousel";

// Combine the state types
type StoreState = BannerState & CarouselState;

// Create the Zustand store
export const useStore = create<StoreState>((...a) => ({
  ...createBannerSlice(...a),
  ...createCarouselSlice(...a),
}));
