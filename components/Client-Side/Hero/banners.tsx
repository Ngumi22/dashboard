"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useStore } from "@/app/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

import Link from "next/link";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import BannerForm from "@/app/(backend)/dashboard/banners/banner";
import { Banner } from "@/lib/actions/Banners/bannerType";

interface BannerComponentProps {
  isAdmin: boolean;
  usageContext?: string; // e.g., 'hero', 'category'
}

export default function BannerComponent({
  isAdmin,
  usageContext,
}: BannerComponentProps) {
  const { toast } = useToast();
  const fetchBanners = useStore((state) => state.fetchBanners);
  const banners = useStore((state) => state.banners);
  const loading = useStore((state) => state.loading);
  const removeBanner = useStore((state) => state.deleteBannerState);

  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!banners || banners.length === 0) {
      fetchBanners();
    }
  }, [banners, fetchBanners]);

  // Filter banners using memoization
  const filteredBanners = useMemo(() => {
    if (!Array.isArray(banners)) {
      console.error("banners is not an array:", banners);
      return [];
    }

    return banners.filter((banner) => {
      try {
        const matchesStatus = isAdmin || banner?.status === "active";
        const matchesUsageContext =
          !usageContext || banner?.usage_context_name === usageContext;
        return matchesStatus && matchesUsageContext;
      } catch (error) {
        console.error("Error filtering banner:", error, banner);
        return false; // Exclude problematic banners
      }
    });
  }, [banners, usageContext, isAdmin]);

  const handleDelete = async (banner_id: number) => {
    try {
      removeBanner(banner_id);
      toast({
        variant: "destructive",
        title: "Delete banner",
        description: `Banner with id ${banner_id} deleted successfully`,
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete banner",
        description: `Banner with id ${banner_id} was not deleted successfully`,
        action: <ToastAction altText="Undo">Undo</ToastAction>,
      });
    }
  };

  return (
    <div className="grid">
      <AdminActions
        isAdmin={isAdmin}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        editingBanner={editingBanner}
        setEditingBanner={setEditingBanner}
      />

      {!loading && filteredBanners.length === 0 && (
        <EmptyState isAdmin={isAdmin} setIsDialogOpen={setIsDialogOpen} />
      )}

      {loading ? (
        <LoadingState />
      ) : (
        <BannerList
          banners={filteredBanners}
          isAdmin={isAdmin}
          setEditingBanner={setEditingBanner}
          setIsDialogOpen={setIsDialogOpen}
          handleDelete={handleDelete}
        />
      )}
    </div>
  );
}

// Subcomponent: Admin Actions
const AdminActions = ({
  isAdmin,
  isDialogOpen,
  setIsDialogOpen,
  editingBanner,
  setEditingBanner,
}: {
  isAdmin: boolean;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  editingBanner: Banner | null;
  setEditingBanner: (banner: Banner | null) => void;
}) => {
  useEffect(() => {
    if (!isDialogOpen) {
      // Reset the editing banner when the sheet is closed
      setEditingBanner(null);
    }
  }, [isDialogOpen, setEditingBanner]);

  if (!isAdmin) return null;
  return (
    <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <SheetTrigger className="border border-black p-2 rounded-md justify-self-end my-6">
        {editingBanner ? "Edit Banner" : "Add New Banner"}
      </SheetTrigger>
      <SheetContent className="overflow-scroll">
        <BannerForm
          initialData={editingBanner || undefined}
          onClose={() => setIsDialogOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
};

// Subcomponent: Empty State
const EmptyState = ({
  isAdmin,
  setIsDialogOpen,
}: {
  isAdmin: boolean;
  setIsDialogOpen: (open: boolean) => void;
}) => (
  <div className="text-center my-4">
    <p>No banners available.</p>
    {isAdmin && (
      <Button onClick={() => setIsDialogOpen(true)}>Add New Banner</Button>
    )}
  </div>
);

// Subcomponent: Loading State
const LoadingState = () => (
  <div className="text-center my-4">
    <p>Loading banners...</p>
  </div>
);

// Subcomponent: Banner List
const BannerList = ({
  banners,
  isAdmin,
  setEditingBanner,
  setIsDialogOpen,
  handleDelete,
}: {
  banners: Banner[];
  isAdmin: boolean;
  setEditingBanner: (banner: Banner | null) => void;
  setIsDialogOpen: (open: boolean) => void;
  handleDelete: (banner_id: number) => void;
}) => (
  <ul className="md:size-96 md:w-full grid grid-cols-2 gap-4">
    {banners.map((banner) => (
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
);
