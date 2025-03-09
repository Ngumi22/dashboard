"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Base64Image from "@/components/Data-Table/base64-image";
import { Button } from "@/components/ui/button";
import { useBannersQueryContext } from "@/lib/actions/Hooks/useBanner";
import ElectronicsBanner from "@/components/Client-Side/Hero/banner";

interface BannerProps {
  contextName: string; // Context for fetching banners
  gridCols?: string; // Custom grid columns (e.g., "grid-cols-1 md:grid-cols-3")
  gap?: string; // Custom gap (e.g., "gap-2 md:gap-4")
  height?: string; // Custom height (e.g., "h-32 md:h-44")
  maxBanners?: number; // Maximum number of banners to display
  className?: string; // Additional custom class names
}

function Banners({
  contextName,
  gridCols = "grid-cols-1 md:grid-cols-3", // Default grid columns
  gap = "gap-2 md:gap-4", // Default gap
  height = "h-32 md:h-44", // Default height
  maxBanners = 0, // Default maximum number of banners
  className = "", // Additional custom class names
}: BannerProps) {
  const {
    data: banners,
    isLoading,
    isError,
  } = useBannersQueryContext(contextName);

  // Memoize the sliced banners to avoid recalculating on every render
  const slicedBanners = useMemo(() => {
    if (!banners) return [];
    return maxBanners > 0 ? banners.slice(0, maxBanners) : banners;
  }, [banners, maxBanners]);

  // Loading skeletons
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
    <ul className={`flex md:grid ${gridCols} ${gap} ${height} ${className}`}>
      {slicedBanners.map((banner) => (
        <li
          key={banner.banner_id}
          style={{ backgroundColor: banner.background_color }}
          className="min-w-[180px] md:w-full flex-shrink-0 grid grid-flow-col content-center justify-between p-2 rounded-md">
          <div className="grid">
            <h1
              className="text-xl lg:text-2xl font-semibold"
              style={{ color: banner.text_color }}>
              {banner.title}
            </h1>
            <p className="line-clamp-1" style={{ color: banner.text_color }}>
              {banner.description}
            </p>

            <Button className="text-xs size-18">
              <Link href={String(banner.link)}>Buy Now</Link>
            </Button>
          </div>
          {/* Fixed aspect ratio container for the image */}
          <Base64Image
            src={typeof banner.image === "string" ? banner.image : undefined}
            alt={banner.title}
            width={80}
            height={80}
          />
        </li>
      ))}
    </ul>
  );
}

export default React.memo(Banners);
