"use client";

import { StoreApi, UseBoundStore } from "zustand";

export const useStore = <T, F>(
  store: UseBoundStore<StoreApi<T>>,
  selector: (state: T) => F
): F => {
  return store(selector);
};
