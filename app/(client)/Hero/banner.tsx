"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/app/store";

export default function HeroBanners() {
  const { banners, loading, error, fetchBanners } = useStore((state) => ({
    banners: state.banners,
    loading: state.loading,
    error: state.error,
    fetchBanners: state.fetchBanners,
  }));

  // Fetch banners when the component mounts if not already loaded
  useEffect(() => {
    if (!banners.length) {
      fetchBanners();
    }
  }, [banners, fetchBanners]);

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-full">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="p-2 md:p-3 lg:p-5 lg:basis-64 flex-grow text-center shadow-lg bg-gray-400 animate-pulse h-[4rem]"></div>
          ))}
        </div>
      ) : (
        <ul className="grid grid-cols-3 gap-8">
          {banners.map((banner) => (
            <li
              key={banner.banner_id}
              style={{ backgroundColor: banner.background_color }}
              className="grid grid-flow-col content-center pl-4 rounded-lg">
              <div className="grid space-y-4">
                <h1
                  className="text-xl lg:text-2xl font-semibold"
                  style={{ color: banner.text_color }}>
                  {banner.title}
                </h1>
                <p style={{ color: banner.text_color }}>{banner.description}</p>
                <Link href={String(banner.link)}>
                  <Button>Buy Now</Button>
                </Link>
              </div>
              <div>
                <Image
                  loading="lazy"
                  className="h-full w-auto object-contain"
                  src={`data:image/jpeg;base64,${banner.image}`}
                  alt={banner.title}
                  height={200}
                  width={200}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
