"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useBannersQueryContext } from "@/lib/actions/Hooks/useBanner";
import Image from "next/image";

interface BannerProps {
  contextName: string;
  gridFlow?: string;
  gridCols?: string;
  gap?: string;
  height?: string;
  maxBanners?: number;
  className?: string;
  paddingX?: string;
  paddingY?: string;
}

function Banners({
  contextName,
  gridFlow = "",
  gridCols = "",
  gap = "",
  height = "",
  maxBanners = 0,
  className = "",
  paddingX = "",
  paddingY = "",
}: BannerProps) {
  // This hook will instantly return prefetched data if available.
  const { data: banners, isLoading } = useBannersQueryContext(contextName);

  const slicedBanners = useMemo(() => {
    if (!banners) return [];
    return maxBanners > 0 ? banners.slice(0, maxBanners) : banners;
  }, [banners, maxBanners]);

  // Pre-calculate styles for optimization.
  const bannerStyles = useMemo(
    () =>
      slicedBanners.map((banner) => ({
        backgroundColor: banner.background_color,
        color: banner.text_color,
      })),
    [slicedBanners]
  );

  if (isLoading) {
    return (
      <ul className={`flex md:grid ${gridCols} ${gap} ${height} ${className}`}>
        {Array.from({ length: maxBanners || 3 }).map((_, index) => (
          <li
            key={index}
            className="min-w-[180px] md:w-full flex-shrink-0 grid grid-flow-col content-center justify-between p-2 rounded-md bg-gray-200 animate-pulse">
            <div className="grid gap-2">
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            </div>
            <div className="w-20 h-20 bg-gray-300 rounded"></div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul
      className={`flex md:grid ${gridFlow} ${gridCols} ${gap} ${height} ${className}`}>
      {slicedBanners.map((banner, index) => (
        <li
          key={banner.banner_id}
          style={{ backgroundColor: bannerStyles[index].backgroundColor }}
          className={`w-[56%] md:w-full h-30 md:h-full flex-shrink-0 grid grid-flow-col content-center justify-between p-2 rounded-md ${paddingX} ${paddingY}`}>
          <div className="grid grid-flow-row gap-2 md:gap-4">
            <h1
              className="text-md lg:text-lg font-semibold"
              style={{ color: bannerStyles[index].color }}>
              {banner.title}
            </h1>
            <p
              className="z-10 w-full"
              style={{ color: bannerStyles[index].color }}>
              {banner.description}
            </p>

            <Button className="text-xs size-18 mt-auto  md:text-sm w-fit px-3 md:px-4 py-1.5 md:py-2 h-auto transition-all hover:scale-105">
              <Link href={String(banner.link)}>Buy Now</Link>
            </Button>
          </div>
          <div className="my-auto">
            <Image
              src={`data:image/jpeg;base64,${banner.image}`}
              alt={banner.title}
              width={80}
              height={80}
              className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 object-contain transition-transform hover:scale-105 hover:rotate-3"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default React.memo(Banners);
