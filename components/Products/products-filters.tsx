"use client";

import React from "react";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { createUrl } from "@/lib/actions/Product/utils";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FilterX,
  SlidersHorizontal,
  Check,
  ChevronRight,
  DollarSign,
  Tag,
  Layers,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  image: string;
  parentId: string | null;
  parentName?: string;
}

interface Brand {
  id: string;
  name: string;
}

interface Specification {
  id: string;
  name: string;
  values: string[];
}

interface Filters {
  categories: Category[];
  brands: Brand[];
  specifications: Specification[];
  priceRange: { min: number; max: number };
  tags: string[];
}

type FilterState = {
  priceRange: [number, number];
  selectedCategories: string[];
  selectedBrands: string[];
  selectedSpecs: Record<string, string[]>;
};

export function ProductsFilters({ filters }: { filters: Filters }) {
  const router = useRouter();
  const pathname = usePathname();
  const rawParams = useSearchParams();

  // Build a plain-object version of URL search params
  const buildParamsObj = useCallback(() => {
    const obj: Record<string, string | string[]> = {};
    rawParams.forEach((value, key) => {
      if (obj[key] != null) {
        const existing = obj[key]!;
        obj[key] = Array.isArray(existing)
          ? [...existing, value]
          : [existing, value];
      } else {
        obj[key] = value;
      }
    });
    return obj;
  }, [rawParams]);

  // Initialize filter state from URL + defaults
  const initializeState = useCallback((): FilterState => {
    const params = buildParamsObj();

    // Price
    const priceRange: [number, number] = [
      params.minPrice ? Number(params.minPrice) : filters.priceRange.min,
      params.maxPrice ? Number(params.maxPrice) : filters.priceRange.max,
    ];

    // Categories (URL holds names; map to IDs)
    const selectedCategories: string[] = [];
    const cats = params.category
      ? Array.isArray(params.category)
        ? params.category
        : [params.category]
      : [];
    cats.forEach((name) => {
      const cat = filters.categories.find((c) => c.name === name);
      if (cat) selectedCategories.push(cat.id);
    });

    // Brands (URL holds brand names)
    const selectedBrands = params.brand
      ? Array.isArray(params.brand)
        ? params.brand
        : [params.brand]
      : [];

    // Specs (keys like spec_color)
    const selectedSpecs: Record<string, string[]> = {};
    Object.entries(params).forEach(([key, val]) => {
      if (key.startsWith("spec_")) {
        const specKey = key.replace("spec_", "");
        const values = Array.isArray(val) ? val : [val];
        selectedSpecs[specKey] = values;
      }
    });

    return { priceRange, selectedCategories, selectedBrands, selectedSpecs };
  }, [buildParamsObj, filters]);

  const [state, setState] = useState<FilterState>(() => initializeState());
  const [isOpen, setIsOpen] = useState(false);

  // Whenever URL changes, reset local filter UI
  useEffect(() => {
    setState(initializeState());
  }, [initializeState]);

  // State updater helper
  const updateState = useCallback(
    <K extends keyof FilterState>(
      key: K,
      value: FilterState[K] | ((prev: FilterState[K]) => FilterState[K])
    ) => {
      setState((prev) => ({
        ...prev,
        [key]:
          typeof value === "function"
            ? (value as any)(prev[key])
            : (value as any),
      }));
    },
    []
  );

  // Apply filters: sync local state → URL
  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();

    // Preserve sort
    const sort = rawParams.get("sort");
    if (sort) params.set("sort", sort);

    // Always reset page
    params.delete("page");

    // Price
    if (state.priceRange[0] !== filters.priceRange.min)
      params.set("minPrice", state.priceRange[0].toString());
    if (state.priceRange[1] !== filters.priceRange.max)
      params.set("maxPrice", state.priceRange[1].toString());

    // Categories
    state.selectedCategories.forEach((id) => {
      const cat = filters.categories.find((c) => c.id === id);
      if (cat) params.append("category", cat.name);
    });

    // Brands
    state.selectedBrands.forEach((b) => params.append("brand", b));

    // Specs
    Object.entries(state.selectedSpecs).forEach(([specKey, vals]) => {
      vals.forEach((v) => params.append(`spec_${specKey}`, v));
    });

    router.push(createUrl(pathname, params));
    setIsOpen(false);
  }, [state, filters, rawParams, router, pathname]);

  // Reset all filters
  const handleResetFilters = useCallback(() => {
    const params = new URLSearchParams();
    const sort = rawParams.get("sort");
    if (sort) params.set("sort", sort);
    router.push(createUrl(pathname, params));
  }, [rawParams, router, pathname]);

  // Individual handlers
  const handlePriceChange = useCallback(
    (value: [number, number]) => updateState("priceRange", value),
    [updateState]
  );
  const handleCategoryChange = useCallback(
    (id: string, checked: boolean) =>
      updateState("selectedCategories", (prev) =>
        checked ? [...prev, id] : prev.filter((x) => x !== id)
      ),
    [updateState]
  );
  const handleBrandChange = useCallback(
    (brand: string, checked: boolean) =>
      updateState("selectedBrands", (prev) =>
        checked ? [...prev, brand] : prev.filter((x) => x !== brand)
      ),
    [updateState]
  );
  const handleSpecChange = useCallback(
    (specKey: string, value: string, checked: boolean) =>
      updateState("selectedSpecs", (prev) => {
        const arr = prev[specKey] || [];
        return {
          ...prev,
          [specKey]: checked ? [...arr, value] : arr.filter((v) => v !== value),
        };
      }),
    [updateState]
  );

  // Any filters active?
  const hasFilters =
    state.selectedCategories.length > 0 ||
    state.selectedBrands.length > 0 ||
    Object.values(state.selectedSpecs).some((a) => a.length > 0) ||
    state.priceRange[0] !== filters.priceRange.min ||
    state.priceRange[1] !== filters.priceRange.max;

  // Count active filters
  const activeFilterCount =
    Object.values(state.selectedSpecs).flat().length +
    state.selectedCategories.length +
    state.selectedBrands.length +
    (state.priceRange[0] !== filters.priceRange.min ||
    state.priceRange[1] !== filters.priceRange.max
      ? 1
      : 0);

  // Build parent→subcategories tree
  const parents = filters.categories
    .filter((c) => !c.parentId)
    .map((p) => ({
      ...p,
      subcategories: filters.categories.filter((c) => c.parentId === p.id),
    }))
    .filter((p) => p.subcategories.length > 0);

  const filterContent = (
    <div className="space-y-3">
      {/* Price Range */}
      <div className="space-y-2">
        <div className="flex items-center">
          <h3 className="font-medium">Price Range</h3>
        </div>
        <Slider
          min={filters.priceRange.min}
          max={filters.priceRange.max}
          value={state.priceRange}
          onValueChange={handlePriceChange}
          step={1}
          className="py-2"
        />
        <div className="flex justify-between text-sm font-medium">
          <div className="bg-muted px-2 py-1 rounded-md">
            {formatCurrency(state.priceRange[0])}
          </div>
          <div className="bg-muted px-2 py-1 rounded-md">
            {formatCurrency(state.priceRange[1])}
          </div>
        </div>
      </div>

      <Separator />

      {/* Categories */}
      <Accordion
        type="multiple"
        defaultValue={["categories"]}
        className="w-full">
        <AccordionItem value="categories" className="border-none">
          <AccordionTrigger className="py-1 hover:no-underline mb-2">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span className="font-medium">Categories</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="pr-4">
              <div className="space-y-2">
                {parents.map((parent) => (
                  <div key={parent.id} className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">
                      {parent.name}
                    </div>
                    <div className="ml-3 space-y-0.5">
                      {parent.subcategories.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center space-x-2 py-0.5 group">
                          <Checkbox
                            id={`cat-${sub.id}`}
                            checked={state.selectedCategories.includes(sub.id)}
                            onCheckedChange={(c) =>
                              handleCategoryChange(sub.id, !!c)
                            }
                            className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                          />
                          <Label
                            htmlFor={`cat-${sub.id}`}
                            className="text-sm cursor-pointer group-hover:text-primary transition-colors">
                            {sub.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      {/* Brands */}
      <Accordion type="multiple" defaultValue={["brands"]} className="w-full">
        <AccordionItem value="brands" className="border-none">
          <AccordionTrigger className="py-1 hover:no-underline mb-2">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              <span className="font-medium">Brands</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="pr-4">
              <div className="grid grid-cols-1 gap-1">
                {filters.brands.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center space-x-2 py-1 group">
                    <Checkbox
                      id={`brand-${b.id}`}
                      checked={state.selectedBrands.includes(b.name)}
                      onCheckedChange={(c) => handleBrandChange(b.name, !!c)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <Label
                      htmlFor={`brand-${b.id}`}
                      className="text-sm cursor-pointer group-hover:text-primary transition-colors">
                      {b.name}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Specs */}
      {filters.specifications.map((spec) => {
        const key = spec.name.toLowerCase().replace(/\s+/g, "_");
        return (
          <React.Fragment key={spec.id}>
            <Separator className="my-2" />
            <Accordion type="multiple" className="w-full">
              <AccordionItem value={`spec-${spec.id}`} className="border-none">
                <AccordionTrigger className="py-1 hover:no-underline mb-2">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="font-medium">{spec.name}</span>
                    {(state.selectedSpecs[key] || []).length > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {(state.selectedSpecs[key] || []).length}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className="pr-4">
                    <div className="grid grid-cols-1 gap-1">
                      {spec.values.length > 0 ? (
                        spec.values.map((val, i) => {
                          const checked = (
                            state.selectedSpecs[key] || []
                          ).includes(val);
                          return (
                            <div
                              key={`${spec.id}-${i}`}
                              className="flex items-center space-x-2 py-1 group">
                              <Checkbox
                                id={`${key}-${i}`}
                                checked={checked}
                                onCheckedChange={(c) =>
                                  handleSpecChange(key, val, !!c)
                                }
                                className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                              />
                              <Label
                                htmlFor={`${key}-${i}`}
                                className="text-sm cursor-pointer group-hover:text-primary transition-colors">
                                {val}
                              </Label>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">
                          No options available
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile */}
      <div className="lg:hidden mb-6">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-32 flex items-center justify-between gap-2 h-12 px-4 border-primary/20 shadow-sm">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <span>Filters</span>
              </div>
              {hasFilters && (
                <Badge variant="default" className="rounded-full">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="h-[85vh] sm:h-[90vh] rounded-t-xl pt-4">
            <SheetHeader className="text-left mb-4">
              <SheetTitle className="text-xl flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                Filter Products
              </SheetTitle>
              <SheetDescription>
                Refine your search with the options below
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100%-180px)]">
              <div className="pr-4 pb-8">{filterContent}</div>
            </ScrollArea>
            <SheetFooter className="flex-row gap-3 sm:justify-between border-t pt-4 mt-2">
              {hasFilters && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleResetFilters}
                  className="flex-1">
                  <FilterX className="h-4 w-4 mr-2" />
                  Reset All
                </Button>
              )}
              <Button size="lg" onClick={applyFilters} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block sticky top-4 h-fit">
        <div className="border rounded-xl shadow-sm overflow-hidden">
          <div className="bg-muted/30 px-4 py-3 border-b">
            <h2 className="font-semibold text-md flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              Filters
              {hasFilters && (
                <Badge variant="default" className="ml-auto rounded-full">
                  {activeFilterCount}
                </Badge>
              )}
            </h2>
          </div>
          <div className="p-4">{filterContent}</div>
          <div className="px-4 py-3 bg-muted/30 border-t flex gap-3">
            {hasFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="flex-1">
                <FilterX className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
            <Button size="sm" onClick={applyFilters} className="flex-1">
              <Check className="h-4 w-4 mr-2" />
              Apply
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
