"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchBannersByContext } from "@/lib/actions/Banners/fetch";
import { Banner } from "@/lib/actions/Banners/bannerType";
import dynamic from "next/dynamic";

// Lazy load heavy dependencies
const Base64Image = dynamic(
  () => import("@/components/Data-Table/base64-image"),
  { ssr: false }
);

const Link = dynamic(() => import("next/link"), { ssr: false });

const MINUTE = 1000 * 60;

interface BannerProps {
  contextName: string;
  initialData?: any;
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
  const {
    data: banners = initialData, // Fallback to server data
    isLoading,
    isError,
    refetch, // Allows retrying manually
  } = useQuery({
    queryKey: ["bannerData", contextName], // Must match server-side
    queryFn: () => fetchBannersByContext(contextName),
    initialData,
    staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
    gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hours
    enabled: Boolean(contextName),
    refetchOnWindowFocus: false, // Prevent refetching when switching tabs
  });

  // Memoized transformations (same optimization pattern)
  const slicedBanners = useMemo(() => {
    if (!banners) return [];
    return maxBanners > 0 ? banners.slice(0, maxBanners) : banners;
  }, [banners, maxBanners]);

  const bannerStyles = useMemo(
    () =>
      slicedBanners.map((banner: Banner) => ({
        backgroundColor: banner.background_color,
        color: banner.text_color,
      })),
    [slicedBanners]
  );

  // Error Handling with Retry
  if (isError) {
    return (
      <div className="text-center text-red-500">
        <ul
          className={`flex md:grid ${gridCols} ${gap} ${height} ${className}`}>
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
        <button
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
          Retry
        </button>
      </div>
    );
  }

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
      {slicedBanners.map((banner: Banner, index: number) => (
        <li
          key={banner.banner_id}
          style={{ backgroundColor: bannerStyles[index].backgroundColor }}
          className={`w-[56%] md:w-full h-30 md:h-full flex-shrink-0 grid grid-flow-col content-center justify-between p-1 md:p-2 md:rounded-md ${paddingX} ${paddingY}`}>
          <div className="grid grid-flow-row gap-1 md:gap-4">
            <h1
              className="text-sm lg:text-lg font-semibold"
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
