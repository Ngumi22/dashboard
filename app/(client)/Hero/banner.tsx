"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/app/store"; // Zustand store for banner state

export default function HeroBanners() {
  const { banners, loading, error, fetchBanners } = useStore((state) => ({
    banners: state.banners,
    loading: state.loading,
    error: state.error,
    fetchBanners: state.fetchBanners,
  }));

  // Fetch banners when the component mounts
  useEffect(() => {
    if (banners.length === 0) {
      fetchBanners(); // Only fetch if banners are not already available
    }
  }, [banners, fetchBanners]);

  // Show loading state while fetching banners
  if (loading) return <div>Loading banners...</div>;

  // Handle error if fetching banners fails
  if (error) return <div>Error: {error}</div>;

  // Render banners once they are loaded
  return (
    <div className="w-full">
      <ul className="grid grid-cols-2 gap-4">
        {banners?.map((banner) => (
          <li
            key={banner.banner_id}
            style={{
              backgroundColor: banner.background_color, // Default fallback color
            }}
            className="h-56 grid grid-flow-col content-center pl-4 rounded-lg">
            <div className="grid space-y-4">
              <h1
                className="text-xl lg:text-2xl font-semibold"
                style={{
                  textDecorationColor: banner.text_color, // Default fallback color
                }}>
                {banner.title}
              </h1>
              <p
                style={{
                  textDecorationColor: banner.text_color, // Default fallback color
                }}>
                {banner.description}
              </p>
              <Link href={String(banner.link)}>
                <Button>Buy Now</Button>
              </Link>
            </div>
            <div>
              <Image
                loading="lazy"
                className="h-auto w-[80%] overflow-hidden object-contain"
                src={`data:image/jpeg;base64,${banner.image}`}
                alt={banner.title}
                height={200}
                width={200}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
