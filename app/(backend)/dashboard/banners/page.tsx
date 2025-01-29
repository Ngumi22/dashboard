"use client";

import BannerComponent from "@/components/Client-Side/Hero/banners";

export default function Bannerspage() {
  return (
    <div className="flex-1 scrollbar overflow-x-scroll lg:overflow-hidden flex md:grid md:grid-cols-2 gap-2 md:gap-4 h-32 md:h-96">
      <BannerComponent isAdmin />
    </div>
  );
}
