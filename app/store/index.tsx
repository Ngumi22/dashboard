import { create } from "zustand";
import { createBannerSlice, BannerState } from "./banners";
import { createCarouselSlice, CarouselState } from "./carousel";
import { createProductSlice, ProductState } from "./product";
import { CategoryState, createCategorySlice } from "./category";
import { BrandState, createBrandSlice } from "./brand";
import { createSupplierSlice, SupplierState } from "./supplier";
import { createVariantSlice, VariantState } from "./variants";

// Combine the state types
type StoreState = BannerState &
  CarouselState &
  ProductState &
  CategoryState &
  BrandState &
  SupplierState &
  VariantState;

// Create the Zustand store
export const useStore = create<StoreState>((...a) => ({
  ...createBannerSlice(...a),
  ...createCarouselSlice(...a),
  ...createProductSlice(...a),
  ...createCategorySlice(...a),
  ...createBrandSlice(...a),
  ...createSupplierSlice(...a),
  ...createVariantSlice(...a),
}));
