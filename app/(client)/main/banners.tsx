"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Banner } from "@/lib/actions/Banners/bannerType";
import { useBanners } from "@/lib/actions/Banners/hooks";
import dynamic from "next/dynamic";
import Link from "next/link";

const Base64Image = dynamic(
  () => import("@/components/Data-Table/base64-image"),
  { ssr: false }
);

interface BannerProps {
  contextName: string;
  initialData?: Banner[];
  gridFlow?: string;
  gridCols?: string;
  gap?: string;
  height?: string;
  maxBanners?: number;
  className?: string;
  paddingX?: string;
  paddingY?: string;
}

function BannerSkeletonList({
  count = 3,
  gridCols = "",
  gap = "",
  height = "",
  className = "",
}: {
  count?: number;
  gridCols?: string;
  gap?: string;
  height?: string;
  className?: string;
}) {
  return (
    <ul className={`flex md:grid ${gridCols} ${gap} ${height} ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
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

function Banners({
  contextName,
  initialData,
  gridFlow = "",
  gridCols = "",
  gap = "",
  height = "",
  maxBanners = 0,
  className = "",
  paddingX = "",
  paddingY = "",
}: BannerProps) {
  const { data: banners = [], isLoading, isError } = useBanners(contextName);

  const slicedBanners = useMemo(() => {
    return maxBanners > 0 ? banners.slice(0, maxBanners) : banners;
  }, [banners, maxBanners]);

  if (isLoading || isError) {
    return (
      <BannerSkeletonList
        count={maxBanners || 3}
        gridCols={gridCols}
        gap={gap}
        height={height}
        className={className}
      />
    );
  }

  return (
    <ul
      className={`flex md:grid ${gridFlow} ${gridCols} ${gap} ${height} ${className}`}>
      {slicedBanners.map((banner: Banner) => (
        <li
          key={banner.banner_id}
          style={{ backgroundColor: banner.background_color }}
          className={`w-[56%] md:w-full h-30 md:h-full flex-shrink-0 grid grid-flow-col content-center justify-between p-1 md:p-2 md:rounded-md ${paddingX} ${paddingY}`}>
          <div className="grid grid-flow-row gap-1 md:gap-4">
            <h1
              className="text-sm lg:text-lg font-semibold"
              style={{ color: banner.text_color }}>
              {banner.title}
            </h1>
            <p className="z-10 w-full" style={{ color: banner.text_color }}>
              {banner.description}
            </p>

            <Button className="text-xs size-18 mt-auto md:text-sm w-fit px-3 md:px-4 py-1.5 md:py-2 h-auto transition-all hover:scale-105">
              <Link href={String(banner.link)}>Buy Now</Link>
            </Button>
          </div>
          <div className="my-auto">
            <Base64Image
              src={banner.image}
              alt={banner.title}
              width={105}
              height={105}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default React.memo(Banners);
