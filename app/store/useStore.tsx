"use client";
import { create } from "zustand";

type Store = {
  loading: boolean;
  products: any[];
  error: string | null;
  searchTerm: string;
  activeTab: string;
  brand: string | null;
  category: string | null;
  priceRange: [number, number] | null;
  discount: [number, number] | null;
  supplier: string | null;
  pagination: { limit: number; offset: number };
  setLoading: (loading: boolean) => void;
  setProducts: (products: any[]) => void;
  setError: (error: string | null) => void;
  setSearchTerm: (searchTerm: string) => void;
  setActiveTab: (activeTab: string) => void;
  setBrand: (brand: string | null) => void;
  setCategory: (category: string | null) => void;
  setPriceRange: (priceRange: [number, number] | null) => void;
  setDiscount: (discount: [number, number] | null) => void;
  setSupplier: (supplier: string | null) => void;
  setPagination: (pagination: { limit: number; offset: number }) => void;
};

export const useStore = create<Store>((set) => ({
  loading: true,
  products: [],
  error: null,
  searchTerm: "",
  activeTab: "all",
  brand: null,
  category: null,
  priceRange: null,
  discount: null,
  supplier: null,
  pagination: { limit: 10, offset: 0 },
  setLoading: (loading) => set({ loading }),
  setProducts: (products) => set({ products }),
  setError: (error) => set({ error }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setBrand: (brand) => set({ brand }),
  setCategory: (category) => set({ category }),
  setPriceRange: (priceRange) => set({ priceRange }),
  setDiscount: (discount) => set({ discount }),
  setSupplier: (supplier) => set({ supplier }),
  setPagination: (pagination) => set({ pagination }),
}));
