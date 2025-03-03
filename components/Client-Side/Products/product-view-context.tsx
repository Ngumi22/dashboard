"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

// Local storage keys
export const GRID_VIEW_KEY = "product-grid-view";
export const PER_PAGE_KEY = "product-per-page";

type ProductViewContextType = {
  gridView: string;
  setGridView: (view: string) => void;
  perPage: string;
  setPerPage: (perPage: string) => void;
};

const ProductViewContext = createContext<ProductViewContextType | undefined>(
  undefined
);

export function ProductViewProvider({ children }: { children: ReactNode }) {
  const [gridView, setGridView] = useState<string>("4");
  const [perPage, setPerPage] = useState<string>("12");

  // Load saved preferences on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedGridView = localStorage.getItem(GRID_VIEW_KEY);
      const savedPerPage = localStorage.getItem(PER_PAGE_KEY);

      if (savedGridView) setGridView(savedGridView);
      if (savedPerPage) setPerPage(savedPerPage);
    }
  }, []);

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem(GRID_VIEW_KEY, gridView);
  }, [gridView]);

  useEffect(() => {
    localStorage.setItem(PER_PAGE_KEY, perPage);
  }, [perPage]);

  return (
    <ProductViewContext.Provider
      value={{ gridView, setGridView, perPage, setPerPage }}>
      {children}
    </ProductViewContext.Provider>
  );
}

export function useProductView() {
  const context = useContext(ProductViewContext);
  if (context === undefined) {
    throw new Error("useProductView must be used within a ProductViewProvider");
  }
  return context;
}
