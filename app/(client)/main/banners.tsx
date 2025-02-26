"use client";
import Base64Image from "@/components/Data-Table/base64-image";
import { Button } from "@/components/ui/button";
import {
  useBannersQuery,
  useBannersQueryContext,
} from "@/lib/actions/Hooks/useBanner";
import Link from "next/link";

interface BannerProps {
  contextName: string;
}

export default function Bannners({ contextName }: BannerProps) {
  const { data: banners } = useBannersQueryContext(contextName);

  const slicedBanners = banners?.slice(0, 3);
  return (
    <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 h-32 md:h-44 my-6">
      {slicedBanners?.map((banner) => (
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
