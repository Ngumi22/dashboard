"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/app/store"; // Zustand store
import MainNav from "@/components/Client-Side/navigation/main-nav";
import Loading from "@/app/(client)/loading";

export default function ClientSideWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, fetchBanners } = useStore((state) => state); // Zustand loading state
  const [mounted, setMounted] = useState(false);

  // Trigger state changes on mount (run after the first render)
  useEffect(() => {
    setMounted(true); // Ensure component is mounted on the client side
    if (!loading) {
      console.log("Fetching banners...");
      fetchBanners(); // Ensure banners are fetched after mounting
    }
  }, [loading, fetchBanners]);

  console.log("Mounted:", mounted);
  console.log("Loading:", loading);

  // Prevent rendering until mounted or loading state is finished
  if (!mounted || loading) {
    return <Loading />;
  }

  return (
    <>
      <MainNav />
      {children} {/* Render the page content after loading is complete */}
    </>
  );
}
