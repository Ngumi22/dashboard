"use client";

import { useState, useEffect } from "react";
import Loading from "@/app/(client)/loading";
import { useStore } from "@/app/store";

export default function ClientSideWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);

  // Access store methods to fetch data
  const fetchBanners = useStore((state) => state.fetchBanners);
  const fetchCarousels = useStore((state) => state.fetchCarousels);
  const fetchCategories = useStore(
    (state) => state.fetchUniqueCategoriesWithSubs
  );
  const fetchProducts = useStore((state) => state.fetchProductsState);
  // Fetch all data on initial render
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await Promise.all([
          fetchBanners(),
          fetchCarousels(),
          fetchCategories(),
          fetchProducts(1, {}), // Pass the required arguments, e.g., currentPage and pageSize
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false); // Set loading to false after all data is fetched
      }
    };

    fetchAllData();
  }, [fetchBanners, fetchCarousels, fetchCategories, fetchProducts]);

  if (isLoading) {
    return <Loading />; // Show loading spinner or skeleton UI
  }

  return <section className="mt-[9.5rem] lg:mt-[11.5rem]">{children}</section>;
}
