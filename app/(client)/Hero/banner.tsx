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

  if (loading) return <div>Loading banners...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-full">
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((banner) => (
          <li
            key={banner.banner_id}
            style={{ backgroundColor: banner.background_color }}
            className="h-56 grid grid-flow-col content-center pl-4 rounded-lg">
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
    </div>
  );
}
