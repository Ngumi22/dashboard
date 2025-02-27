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
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Fetch banners only if they are not already loaded
  useEffect(() => {
    if (!banners || banners.length === 0) {
      fetchBanners();
    }
  }, [banners, fetchBanners]);

  // Filter banners based on usage context and admin status
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

  // Handle banner deletion
  const handleDelete = useCallback(
    async (banner_id: number) => {
      try {
        await removeBanner(banner_id); // Delete banner from the database
        fetchBanners(); // Refetch banners to update the UI
        toast({
          variant: "destructive",
          title: "Banner Deleted",
          description: `Banner with ID ${banner_id} was deleted successfully.`,
          action: <ToastAction altText="Close">Close</ToastAction>,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to delete banner with ID ${banner_id}.`,
          action: <ToastAction altText="Try Again">Try Again</ToastAction>,
        });
      }
    },
    [removeBanner, fetchBanners, toast]
  );

  // Handle form submission success
  const handleFormSuccess = useCallback(() => {
    setIsSheetOpen(false); // Close the sheet
    fetchBanners(); // Refetch banners to update the UI
    setEditingBanner(null); // Reset editing banner
  }, [fetchBanners]);

  return (
    <div className="grid">
      {/* Admin Actions (Add/Edit Banner) */}
      <AdminActions
        isAdmin={isAdmin}
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        editingBanner={editingBanner}
        setEditingBanner={setEditingBanner}
        onFormSuccess={handleFormSuccess}
      />

      {/* Empty State */}
      {filteredBanners.length === 0 && (
        <EmptyState isAdmin={isAdmin} setIsSheetOpen={setIsSheetOpen} />
      )}

      {/* Banner List */}
      <BannerList
        banners={filteredBanners}
        isAdmin={isAdmin}
        setEditingBanner={setEditingBanner}
        setIsSheetOpen={setIsSheetOpen}
        handleDelete={handleDelete}
      />
    </div>
  );
}

// Memoize AdminActions to prevent unnecessary re-renders
const AdminActions = React.memo(
  ({
    isAdmin,
    isSheetOpen,
    setIsSheetOpen,
    editingBanner,
    setEditingBanner,
    onFormSuccess,
  }: {
    isAdmin: boolean;
    isSheetOpen: boolean;
    setIsSheetOpen: (open: boolean) => void;
    editingBanner: Banner | null;
    setEditingBanner: (banner: Banner | null) => void;
    onFormSuccess: () => void;
  }) => {
    useEffect(() => {
      if (!isSheetOpen) {
        setEditingBanner(null); // Reset editing banner when the sheet is closed
      }
    }, [isSheetOpen, setEditingBanner]);

    if (!isAdmin) return null;

    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button className="border border-black p-2 rounded-md justify-self-end my-6">
            {editingBanner ? "Edit Banner" : "Add New Banner"}
          </Button>
        </SheetTrigger>
        <SheetContent className="overflow-scroll">
          <BannerForm
            initialData={editingBanner || undefined} // Ensure editingBanner is not null
            onClose={() => setIsSheetOpen(false)}
            onSuccess={onFormSuccess}
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
    setIsSheetOpen,
  }: {
    isAdmin: boolean;
    setIsSheetOpen: (open: boolean) => void;
  }) => (
    <div className="text-center my-4">
      <p>No banners available.</p>
      {isAdmin && (
        <Button onClick={() => setIsSheetOpen(true)}>Add New Banner</Button>
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
    setIsSheetOpen,
    handleDelete,
  }: {
    banners: Banner[];
    isAdmin: boolean;
    setEditingBanner: (banner: Banner | null) => void;
    setIsSheetOpen: (open: boolean) => void;
    handleDelete: (banner_id: number) => void;
  }) => (
    <ul className="flex-1 scrollbar overflow-x-scroll lg:overflow-hidden flex md:grid md:grid-cols-2 gap-2 md:gap-4 h-32 md:h-96">
      {banners.map((banner) => (
        <li
          key={banner.banner_id}
          style={{ backgroundColor: banner.background_color }}
          className="relative min-w-[180px] md:w-full flex-shrink-0 grid grid-flow-col content-center justify-between p-2 rounded-md">
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
                      setIsSheetOpen(true);
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

BannerList.displayName = "BannerList";
