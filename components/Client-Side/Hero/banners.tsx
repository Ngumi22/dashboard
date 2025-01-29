"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import dynamic from "next/dynamic";
import { Banner } from "@/lib/actions/Banners/bannerType";
import Base64Image from "@/components/Data-Table/base64-image";

// Lazy load BannerForm to reduce initial bundle size
const BannerForm = dynamic(
  () => import("@/app/(backend)/dashboard/banners/banner")
);

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

  const removeBanner = useStore((state) => state.deleteBannerState);

  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch banners only if they are not already loaded
  useEffect(() => {
    if (!banners || banners.length === 0) {
      fetchBanners();
    }
  }, [banners, fetchBanners]);

  const filteredBanners = useMemo(() => {
    if (!Array.isArray(banners)) {
      console.error("banners is not an array:", banners);
      return [];
    }

    return banners.filter((banner) => {
      try {
        const matchesStatus = isAdmin || banner?.status === "active";
        const matchesUsageContext =
          !usageContext ||
          banner?.usage_context_name?.toLowerCase() ===
            usageContext.toLowerCase();
        return matchesStatus && matchesUsageContext;
      } catch (error) {
        console.error("Error filtering banner:", error, banner);
        return false; // Exclude problematic banners
      }
    });
  }, [banners, usageContext, isAdmin]);

  // Memoize the delete handler to avoid recreating it on every render
  const handleDelete = useCallback(
    async (banner_id: number) => {
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
    },
    [removeBanner, toast]
  );

  return (
    <div className="grid">
      <AdminActions
        isAdmin={isAdmin}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        editingBanner={editingBanner}
        setEditingBanner={setEditingBanner}
      />

      {filteredBanners.length === 0 && (
        <EmptyState isAdmin={isAdmin} setIsDialogOpen={setIsDialogOpen} />
      )}

      <BannerList
        banners={filteredBanners}
        isAdmin={isAdmin}
        setEditingBanner={setEditingBanner}
        setIsDialogOpen={setIsDialogOpen}
        handleDelete={handleDelete}
      />
    </div>
  );
}

// Memoize AdminActions to prevent unnecessary re-renders
const AdminActions = React.memo(
  ({
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
  }
);

AdminActions.displayName = "AdminActions"; // Add displayName

// Memoize EmptyState to prevent unnecessary re-renders
const EmptyState = React.memo(
  ({
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
  )
);

EmptyState.displayName = "EmptyState"; // Add displayName

// Memoize BannerList to prevent unnecessary re-renders
const BannerList = React.memo(
  ({
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
    <ul className="flex-1 scrollbar overflow-x-scroll lg:overflow-hidden flex md:grid md:grid-cols-2 gap-2 md:gap-4 h-32 md:h-96">
      {banners.map((banner) => (
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
  )
);

BannerList.displayName = "BannerList"; // Add displayName
