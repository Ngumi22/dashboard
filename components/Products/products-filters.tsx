"use client";

import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SearchParams } from "@/lib/actions/Product/searchTypes";
import { createUrl } from "@/lib/actions/Product/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { FilterX, SlidersHorizontal } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ProductsFiltersProps {
  filters: {
    categories: {
      id: string;
      name: string;
      image: string;
      parentId: string | null;
      parentName?: string;
    }[];
    brands: { id: string; name: string }[];
    specifications: { id: string; name: string; values: string[] }[];
    priceRange: { min: number; max: number };
    tags: string[];
  };
  searchParams: SearchParams;
}

export function ProductsFilters({
  filters,
  searchParams,
}: ProductsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  // State for price range with NaN protection
  const [priceRange, setPriceRange] = useState<[number, number]>([
    searchParams.minPrice
      ? Number(searchParams.minPrice)
      : filters.priceRange.min,
    searchParams.maxPrice
      ? Number(searchParams.maxPrice)
      : filters.priceRange.max,
  ]);

  // State for selected categories, brands, and specifications
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    if (Array.isArray(searchParams.category)) {
      // Convert category names back to IDs
      return searchParams.category
        .map(
          (name) => filters.categories.find((c) => c.name === name)?.id || ""
        )
        .filter(Boolean);
    }
    if (searchParams.category) {
      const categoryId =
        filters.categories.find((c) => c.name === searchParams.category)?.id ||
        "";
      return categoryId ? [categoryId] : [];
    }
    return [];
  });

  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    Array.isArray(searchParams.brand)
      ? searchParams.brand
      : searchParams.brand
        ? [searchParams.brand]
        : []
  );

  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string[]>>(
    {}
  );

  // Initialize selected specifications from URL
  // Initialize selected specifications from URL
  useEffect(() => {
    const specs: Record<string, string[]> = {};
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key.startsWith("spec_")) {
        const specName = key.replace("spec_", "").replace(/_/g, " "); // Convert back to original name format
        const specKey = specName.toLowerCase().replace(/\s+/g, "_"); // Create consistent key

        specs[specKey] = Array.isArray(value)
          ? value.filter((v): v is string => typeof v === "string")
          : typeof value === "string"
            ? [value]
            : [];
      }
    });
    setSelectedSpecs(specs);
  }, [searchParams]);

  // Group categories by parent
  const groupedCategories = filters.categories.reduce(
    (acc, category) => {
      const parentId = category.parentId || "root";
      if (!acc[parentId]) {
        acc[parentId] = {
          parent: category.parentId
            ? filters.categories.find((c) => c.id === category.parentId)
            : null,
          children: [],
        };
      }
      acc[parentId].children.push(category);
      return acc;
    },
    {} as Record<string, { parent: any; children: any[] }>
  );

  // Apply filters with proper URL parameters
  const applyFilters = () => {
    const params = new URLSearchParams();

    // Preserve existing params
    if (searchParams.sort) params.set("sort", searchParams.sort);
    if (searchParams.page) params.delete("page"); // Reset to page 1 on filter change

    // Price range
    if (priceRange[0] !== filters.priceRange.min) {
      params.set("minPrice", priceRange[0].toString());
    }
    if (priceRange[1] !== filters.priceRange.max) {
      params.set("maxPrice", priceRange[1].toString());
    }

    // Categories (using names in URL)
    selectedCategories.forEach((categoryId) => {
      const category = filters.categories.find((c) => c.id === categoryId);
      if (category) {
        params.append("category", category.name);
      }
    });

    // Brands
    selectedBrands.forEach((brand) => {
      params.append("brand", brand);
    });

    // Specifications
    Object.entries(selectedSpecs).forEach(([specName, values]) => {
      values.forEach((value) => {
        params.append(`spec_${specName}`, value);
      });
    });

    router.push(createUrl(pathname, params));
  };

  const handleResetFilters = () => {
    router.push(pathname);
  };

  const handleSpecChange = (
    specName: string,
    value: string,
    checked: boolean
  ) => {
    // Create consistent key format (lowercase with underscores)
    const specKey = specName.toLowerCase().replace(/\s+/g, "_");

    setSelectedSpecs((prev) => {
      const currentValues = prev[specKey] || [];
      return {
        ...prev,
        [specKey]: checked
          ? [...currentValues, value]
          : currentValues.filter((v) => v !== value),
      };
    });
  };

  const hasFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    Object.values(selectedSpecs).some((values) => values.length > 0) ||
    priceRange[0] !== filters.priceRange.min ||
    priceRange[1] !== filters.priceRange.max;

  const filterContent = (
    <div className="space-y-4">
      {/* Price Range Filter */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm">Price Range</h3>
        <Slider
          min={filters.priceRange.min}
          max={filters.priceRange.max}
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          step={1}
        />
        <div className="flex justify-between text-sm">
          <span>{formatCurrency(priceRange[0])}</span>
          <span>{formatCurrency(priceRange[1])}</span>
        </div>
      </div>

      {/* Hierarchical Categories Filter */}
      <Accordion type="multiple" defaultValue={["categories"]}>
        <AccordionItem value="categories">
          <AccordionTrigger className="text-sm font-semibold">
            Categories
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {Object.entries(groupedCategories).map(([parentId, group]) => (
                <div key={parentId} className="space-y-1">
                  {group.parent && (
                    <div className="font-medium text-xs pl-2 py-1 text-gray-600">
                      {group.parent.name}
                    </div>
                  )}
                  <div
                    className={
                      group.parent ? "pl-4 border-l-2 border-gray-200" : ""
                    }>
                    {group.children.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`cat-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={(checked) => {
                            setSelectedCategories((prev) =>
                              checked
                                ? [...prev, category.id]
                                : prev.filter((id) => id !== category.id)
                            );
                          }}
                        />
                        <Label
                          htmlFor={`cat-${category.id}`}
                          className="text-xs font-normal cursor-pointer">
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Brands Filter */}
      <Accordion type="multiple" defaultValue={["brands"]}>
        <AccordionItem value="brands">
          <AccordionTrigger className="text-sm font-semibold">
            Brands
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {filters.brands.map((brand) => (
                <div
                  key={brand.id}
                  className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id={`brand-${brand.id}`}
                    checked={selectedBrands.includes(brand.name)}
                    onCheckedChange={(checked) => {
                      setSelectedBrands((prev) =>
                        checked
                          ? [...prev, brand.name]
                          : prev.filter((name) => name !== brand.name)
                      );
                    }}
                  />
                  <Label
                    htmlFor={`brand-${brand.id}`}
                    className="text-xs font-normal cursor-pointer">
                    {brand.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Specifications Filter */}
      {filters.specifications.map((spec) => {
        // Create consistent key format (same as handleSpecChange)
        const specKey = spec.name.toLowerCase().replace(/\s+/g, "_");

        return (
          <Accordion key={spec.id} type="multiple">
            <AccordionItem value={`spec-${spec.id}`}>
              <AccordionTrigger className="text-sm font-semibold">
                {spec.name}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {spec.values && spec.values.length > 0 ? (
                    spec.values.map((value: string, index: number) => {
                      // Normalize the value for comparison
                      const normalizedValue = value.trim().toLowerCase();
                      const isChecked = (selectedSpecs[specKey] || []).some(
                        (v) => v.trim().toLowerCase() === normalizedValue
                      );

                      return (
                        <div
                          key={`${spec.id}-${index}`}
                          className="flex items-center space-x-2">
                          <Checkbox
                            id={`${specKey}-${index}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              handleSpecChange(spec.name, value, !!checked);
                            }}
                          />
                          <Label
                            htmlFor={`${specKey}-${index}`}
                            className="cursor-pointer">
                            {value}
                          </Label>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-gray-500">
                      No options available
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      })}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-2">
        <Button size="sm" onClick={applyFilters}>
          Apply Filters
        </Button>
        {hasFilters && (
          <Button size="sm" variant="outline" onClick={handleResetFilters}>
            <FilterX className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Sheet */}
      <div className="lg:hidden mb-4 flex justify-self-end">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasFilters && (
                <Badge className="ml-2 bg-primary text-primary-foreground">
                  {Object.keys(selectedSpecs).reduce(
                    (count, key) => count + selectedSpecs[key].length,
                    selectedCategories.length + selectedBrands.length
                  ) +
                    (priceRange[0] !== filters.priceRange.min ||
                    priceRange[1] !== filters.priceRange.max
                      ? 1
                      : 0)}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader className="mb-4">
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Narrow down your product selection
              </SheetDescription>
            </SheetHeader>
            <div className="overflow-y-auto h-[calc(100%-100px)]">
              {filterContent}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block sticky top-4 h-fit">
        <div className="border rounded-lg p-4 space-y-4">
          <h2 className="font-semibold text-lg mb-2">Filters</h2>
          {filterContent}
        </div>
      </div>
    </>
  );
}
