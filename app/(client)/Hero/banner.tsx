"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { getUniqueBanners } from "@/lib/actions/Banners/fetch";
import Image from "next/image";
import Link from "next/link";

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

export default function HeroBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    async function fetchBanners() {
      let res = await getUniqueBanners();
      setBanners(res);
    }
    fetchBanners();
  }, []);

  return (
    <div className="w-full">
      <ul className="grid grid-cols-2 gap-2">
        {banners?.map((banner) => (
          <li
            key={banner.banner_id}
            style={{
              backgroundColor: banner.background_color, // Default fallback color
            }}
            className="h-52 grid grid-flow-col content-center pl-4 rounded-lg">
            <div className="grid space-y-4">
              <h1
                className="text-xl lg:text-2xl font-semibold"
                style={{
                  textDecorationColor: banner.text_color, // Default fallback color
                }}>
                {banner.title}
              </h1>
              <p
                style={{
                  textDecorationColor: banner.text_color, // Default fallback color
                }}>
                {banner.description}
              </p>
              <Link href={String(banner.link)}>
                <Button>Buy Now</Button>
              </Link>
            </div>
            <div>
              <Image
                loading="lazy"
                className="h-auto w-auto object-contain"
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
