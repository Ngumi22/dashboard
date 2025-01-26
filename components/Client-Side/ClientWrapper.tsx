"use client";

import { useState, useEffect } from "react";
import Loading from "@/app/(client)/loading";
import NewNavbar from "./Navbar/Navbar";
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

  // Fetch all data on initial render
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await Promise.all([fetchBanners(), fetchCarousels()]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false); // Set loading to false after all data is fetched
      }
    };

    fetchAllData();
  }, [fetchBanners, fetchCarousels]);

  if (isLoading) {
    return <Loading />; // Show loading spinner or skeleton UI
  }

  return (
    <>
      <NewNavbar />
      {children}
    </>
  );
}
