// store/index.ts
import { create } from "zustand";
import { createBannerSlice, BannerState } from "./banners";

type StoreState = BannerState;

export const useStore = create<StoreState>((...a) => ({
  ...createBannerSlice(...a),
}));
