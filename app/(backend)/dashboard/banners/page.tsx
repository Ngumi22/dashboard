"use client";

import { getUniqueBanners } from "@/lib/actions/Banners/fetch";
import { useEffect, useState } from "react";
import BannerForm from "./banner";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export interface Banner {
  banner_id?: number;
  title: string;
  description?: string;
  link?: string;
  image?: File;
  text_color: string;
  background_color: string;
  usage_context: string;
  status: "active" | "inactive";
}

export default function Bannerspage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  useEffect(() => {
    async function fetchBanners() {
      let res = await getUniqueBanners();
      setBanners(res);
    }
    fetchBanners();
  }, []);
  return (
    <section className="m-4 grid justify-items-stretch space-y-8">
      <div className="justify-self-end">
        <Sheet>
          <SheetTrigger className="border border-black p-2 rounded-md">
            Create Banner
          </SheetTrigger>
          <SheetContent className="overflow-scroll">
            <BannerForm />
          </SheetContent>
        </Sheet>
      </div>
      <div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full gap-6 place-items-center">
          {banners?.map((banner) => (
            <li key={banner.banner_id} className="group">
              <div
                className="grid grid-flow-col h-full w-full overflow-hidden rounded-lg shadow-lg"
                style={{ backgroundColor: banner.background_color }}>
                <div className="col-span-2 sm:col-span-1 p-6 flex flex-col justify-between relative z-10">
                  <div className="space-y-4">
                    <h2
                      className="text-xl sm:text-2xl font-semibold line-clamp-2 transition-colors duration-300"
                      style={{ color: banner.text_color }}>
                      {banner.title}
                    </h2>
                    <p
                      className="text-sm sm:text-base line-clamp-3 transition-colors duration-300"
                      style={{ color: banner.text_color }}>
                      {banner.description}
                    </p>
                    <p
                      className="text-sm sm:text-base line-clamp-2 transition-colors duration-300"
                      style={{ color: banner.text_color }}>
                      {banner.usage_context}
                    </p>
                  </div>
                  <Link
                    href={String(banner.link)}
                    className="mt-4 inline-block">
                    <Button className="transition-transform duration-300 hover:scale-105">
                      Buy Now
                    </Button>
                  </Link>
                </div>
                <div className="inset-x-10 relative overflow-hidden grid place-items-center">
                  <Image
                    src={`data:image/jpeg;base64,${banner.image}`}
                    alt={banner.title}
                    height={200}
                    width={200}
                    className="object-contain transition-all duration-500 ease-in-out group-hover:scale-125 hover:ease-out h-auto w-32 my-auto"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
