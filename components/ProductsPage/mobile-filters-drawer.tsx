"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { ProductFilters } from "./product-filters";
import type { SearchParams } from "@/lib/actions/Product/search-params";

interface MobileFiltersDrawerProps {
  availableFilters: {
    categories: { id: string; name: string }[];
    brands: { id: string; name: string }[];
    specifications: { id: string; name: string; values: string[] }[];
    minPrice: number;
    maxPrice: number;
  };
  currentFilters: SearchParams;
  setFilters: (filters: Partial<SearchParams>) => void;
}

export function MobileFiltersDrawer({
  availableFilters,
  currentFilters,
  setFilters,
}: MobileFiltersDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[100vh] overflow-y-auto rounded-none">
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <ProductFilters
            availableFilters={availableFilters}
            currentFilters={currentFilters}
            setFilters={setFilters}
          />
        </div>
        <div className="p-4 border-t">
          <DrawerClose asChild>
            <Button className="w-full">Done</Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
