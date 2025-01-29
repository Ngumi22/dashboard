"use client";

import BannerComponent from "@/components/Client-Side/Hero/banners";

export default function Banners1() {
  return (
    <div className="flex">
      <BannerComponent isAdmin={false} usageContext="Hero" />
    </div>
  );
}
