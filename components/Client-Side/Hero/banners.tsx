"use client";

import * as React from "react";
import { useStore } from "@/app/store";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import router from "next/router";
import Link from "next/link";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import BannerForm from "@/app/(backend)/dashboard/banners/banner";

export interface Banner {
  banner_id?: number;
  title: string;
  description?: string;
  link?: string;
  image?: string | File | undefined;
  text_color: string;
  background_color: string;
  usage_context: string;
  status: "active" | "inactive";
}

interface HeroBannersProps {
  isAdmin?: boolean; // Pass this prop to determine if admin features should be shown
}

export default function BannerComponent({ isAdmin }: HeroBannersProps) {
  const { toast } = useToast();
  const fetchBanners = useStore((state) => state.fetchBanners);
  const banners = useStore((state) => state.banners);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const removeBanner = useStore((state) => state.deleteBannerState);

  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch banners when the component mounts if not already loaded
  useEffect(() => {
    if (!banners.length) {
      fetchBanners();
    }
  }, [banners, fetchBanners]);

  const handleDelete = async (banner_id: number) => {
    try {
      removeBanner(banner_id); // Update Zustand state
      toast({
        variant: "destructive",
        title: "Delete banner",
        description: `Banner with id ${banner_id} deleted successfully`,
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
      router.push("http://localhost:3000/dashboard/banners");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete banner",
        description: `Banner with id ${banner_id} was not deleted successfully`,
        action: <ToastAction altText="Undo">Undo</ToastAction>,
      });
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error Loading</p>;
  }

  // Filter banners for non-admin users to show only "active" banners and limit to 4
  const filteredBanners = isAdmin
    ? banners // Show all banners for admins
    : banners.filter((banner) => banner.status === "active").slice(0, 4); // Show only active banners for non-admins

  return (
    <div className="grid">
      {isAdmin && (
        <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <SheetTrigger className="border border-black p-2 rounded-md justify-self-end my-6">
            {editingBanner ? "Edit Banner" : "Add New Banner"}
          </SheetTrigger>
          <SheetContent className="overflow-scroll">
            <BannerForm initialData={editingBanner || undefined} />
          </SheetContent>
        </Sheet>
      )}
      <ul className="md:size-96 md:w-full grid grid-cols-2 gap-4">
        {filteredBanners.map((banner) => (
          <li
            key={banner.banner_id}
            style={{ backgroundColor: banner.background_color }}
            className="relative h-36 md:h-56 grid grid-flow-col content-center pl-4 rounded-lg">
            <div className="grid sm:space-y-2 space-y-4">
              <h1
                className="text-xl lg:text-2xl font-semibold"
                style={{ color: banner.text_color }}>
                {banner.title}
              </h1>
              <p style={{ color: banner.text_color }}>{banner.description}</p>
              <Link href={String(banner.link)}>
                <Button className="text-center">Buy Now</Button>
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

            {isAdmin && (
              <div className="absolute top-4 right-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      ⋮
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingBanner(banner);
                        setIsDialogOpen(true);
                      }}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(Number(banner.banner_id))}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
