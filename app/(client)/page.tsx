"use client";

import Navbar from "@/components/Client-Side/navigation/nav";
import React, { useEffect } from "react";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { useStore } from "@/app/store/useStore";
import HeroBanners from "./Hero/banner";
import HeroSection from "./Hero/hero";

export default function Page() {
  const {
    products,
    loading,
    error,
    searchTerm,
    activeTab,
    brand,
    category,
    priceRange,
    discount,
    supplier,
    pagination,
    setLoading,
    setProducts,
    setError,
    setSearchTerm,
    setActiveTab,
    setBrand,
    setCategory,
    setPriceRange,
    setDiscount,
    setSupplier,
    setPagination,
  } = useStore((state) => state); // Using Zustand store for state

  const { toast } = useToast();

  // Check if products are in localStorage
  const checkCache = () => {
    const cachedData = localStorage.getItem("productsData");
    return cachedData ? JSON.parse(cachedData) : null;
  };

  const saveToCache = (data: any) => {
    localStorage.setItem("productsData", JSON.stringify(data));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true); // Start loading

      try {
        const cachedProducts = checkCache();
        if (cachedProducts) {
          setProducts(cachedProducts); // Use cached data if available
        } else {
          let url = `/api/productss?page=${
            pagination.offset / pagination.limit + 1
          }`;

          if (searchTerm) url += `&name=${encodeURIComponent(searchTerm)}`;
          if (activeTab !== "all") url += `&status=${activeTab}`;
          if (brand) url += `&brand=${encodeURIComponent(brand)}`;
          if (category) url += `&category=${encodeURIComponent(category)}`;
          if (priceRange) {
            url += `&minPrice=${priceRange[0]}&maxPrice=${priceRange[1]}`;
          }
          if (discount) {
            url += `&minDiscount=${discount[0]}&maxDiscount=${discount[1]}`;
          }
          if (supplier) url += `&supplier=${encodeURIComponent(supplier)}`;

          const res = await fetch(url);

          if (!res.ok) {
            throw new Error("Failed to fetch products");
          }

          const data = await res.json();
          setProducts(data.products); // Update Zustand store with products
          saveToCache(data.products); // Save data to localStorage
        }
      } catch (err) {
        console.error(err);
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage); // Update Zustand store with error
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchProducts();
  }, [
    pagination,
    searchTerm,
    activeTab,
    brand,
    category,
    priceRange,
    discount,
    supplier,
    toast,
    setLoading,
    setProducts,
    setError,
  ]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading-screen">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className="w-12 h-12 animate-spin"
            viewBox="0 0 16 16">
            <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
            <path
              fillRule="evenodd"
              d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <HeroSection />

      {/* <div>
        {products.map((product: any) => (
          <div key={product.id}>
            <p>{product.name}</p>
          </div>
        ))}
      </div> */}
    </div>
  );
}
