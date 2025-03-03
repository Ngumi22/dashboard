"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  getCategories,
  getBrands,
  getSpecifications,
  getTags,
  getMinMaxPrice,
} from "@/lib/actions/Product/sample";
import { useDebounce } from "@/hooks/use-debounce";
import { X } from "lucide-react";

export function ProductFilters({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Get filter data
  const categories = useMemo(() => getCategories(), []);
  const brands = useMemo(() => getBrands(), []);
  const specifications = useMemo(() => getSpecifications(), []);
  const tags = useMemo(() => getTags(), []);
  const { minPrice: absoluteMinPrice, maxPrice: absoluteMaxPrice } = useMemo(
    () => getMinMaxPrice(),
    []
  );

  // Parse current filters from URL
  const currentMinPrice = Number(searchParams.minPrice || absoluteMinPrice);
  const currentMaxPrice = Number(searchParams.maxPrice || absoluteMaxPrice);
  const currentBrands = (searchParams.brand || "")
    .toString()
    .split(",")
    .filter(Boolean);
  const currentCategories = (searchParams.category || "")
    .toString()
    .split(",")
    .filter(Boolean);
  const currentTags = (searchParams.tags || "")
    .toString()
    .split(",")
    .filter(Boolean);
  const currentMinRating = Number(searchParams.minRating || 0);

  // Local state for price range
  const [priceRange, setPriceRange] = useState<[number, number]>([
    currentMinPrice,
    currentMaxPrice,
  ]);

  // Update local state when URL params change
  useEffect(() => {
    setPriceRange([
      Number(searchParams.minPrice || absoluteMinPrice),
      Number(searchParams.maxPrice || absoluteMaxPrice),
    ]);
  }, [
    searchParams.minPrice,
    searchParams.maxPrice,
    absoluteMinPrice,
    absoluteMaxPrice,
  ]);

  // Debounce price changes to avoid too many URL updates
  const debouncedPriceRange = useDebounce(priceRange, 500);

  // Update URL with new filters
  const updateFilters = useCallback(
    (newParams: Record<string, string | null>) => {
      // Create new URLSearchParams object from current searchParams
      const params = new URLSearchParams();

      // Add all current search params
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params.set(key, value.toString());
      });

      // Update with new params
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Always reset to page 1 when filters change
      params.set("page", "1");

      // Update URL
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  // Handle price range change
  useEffect(() => {
    if (
      debouncedPriceRange[0] !== currentMinPrice ||
      debouncedPriceRange[1] !== currentMaxPrice
    ) {
      updateFilters({
        minPrice: debouncedPriceRange[0].toString(),
        maxPrice: debouncedPriceRange[1].toString(),
      });
    }
  }, [debouncedPriceRange, currentMinPrice, currentMaxPrice, updateFilters]);

  // Handle checkbox filters
  const handleCheckboxFilter = useCallback(
    (type: string, value: string, checked: boolean) => {
      const current =
        searchParams[type]?.toString().split(",").filter(Boolean) || [];

      let newValue: string | null;

      if (checked) {
        // Add to filter
        newValue = [...current, value].join(",");
      } else {
        // Remove from filter
        newValue = current.filter((item) => item !== value).join(",");
      }

      // If empty, remove param completely
      if (!newValue) newValue = null;

      updateFilters({ [type]: newValue });
    },
    [searchParams, updateFilters]
  );

  // Clear all filters - just navigate to the base path
  const clearAllFilters = useCallback(() => {
    // Simply navigate to the base path without any query parameters
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  // Check if any filters are applied
  const hasFilters =
    Object.keys(searchParams).length > 0 &&
    // Exclude page parameter from the check if it's the only parameter
    !(Object.keys(searchParams).length === 1 && searchParams.page);

  return (
    <div className="space-y-6 sticky top-4 max-h-[calc(100vh-2rem)] overflow-auto pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Filters</h2>
        {hasFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="h-8 text-xs">
            <X className="mr-1 h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Price Range</h3>
          <div className="px-2">
            <Slider
              value={priceRange}
              min={absoluteMinPrice}
              max={absoluteMaxPrice}
              step={1}
              onValueChange={(value) => setPriceRange([value[0], value[1]])}
              className="my-6"
            />
            <div className="flex items-center justify-between">
              <div className="border rounded-md px-2 py-1 w-24">
                ${priceRange[0]}
              </div>
              <div className="border rounded-md px-2 py-1 w-24 text-right">
                ${priceRange[1]}
              </div>
            </div>
          </div>
        </div>

        <Accordion
          type="multiple"
          defaultValue={["categories", "brands", "ratings", "tags"]}>
          <AccordionItem value="categories">
            <AccordionTrigger>Categories</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={currentCategories.includes(category.id)}
                      onCheckedChange={(checked) =>
                        handleCheckboxFilter(
                          "category",
                          category.id,
                          checked as boolean
                        )
                      }
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="brands">
            <AccordionTrigger>Brands</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {brands.map((brand) => (
                  <div key={brand.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand.id}`}
                      checked={currentBrands.includes(brand.id)}
                      onCheckedChange={(checked) =>
                        handleCheckboxFilter(
                          "brand",
                          brand.id,
                          checked as boolean
                        )
                      }
                    />
                    <label
                      htmlFor={`brand-${brand.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {brand.name}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="ratings">
            <AccordionTrigger>Ratings</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rating-${rating}`}
                      checked={currentMinRating === rating}
                      onCheckedChange={(checked) =>
                        updateFilters({
                          minRating: checked ? rating.toString() : null,
                        })
                      }
                    />
                    <label
                      htmlFor={`rating-${rating}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="text-yellow-400">
                          {i < rating ? "★" : "☆"}
                        </span>
                      ))}
                      {rating === 1 ? " & Up" : " & Up"}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tags">
            <AccordionTrigger>Tags</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {tags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={currentTags.includes(tag)}
                      onCheckedChange={(checked) =>
                        handleCheckboxFilter("tags", tag, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`tag-${tag}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {tag}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="specifications">
            <AccordionTrigger>Specifications</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {specifications.map((spec) => (
                  <div key={spec.id} className="space-y-2">
                    <h4 className="text-sm font-medium">{spec.name}</h4>
                    <div className="space-y-2">
                      {spec.values.map((value) => (
                        <div
                          key={value}
                          className="flex items-center space-x-2">
                          <Checkbox
                            id={`spec-${spec.id}-${value}`}
                            onCheckedChange={(checked) => {
                              const specParam = `spec_${spec.id}`;
                              const current =
                                searchParams[specParam]
                                  ?.toString()
                                  .split(",")
                                  .filter(Boolean) || [];

                              let newValue: string | null;

                              if (checked) {
                                newValue = [...current, value].join(",");
                              } else {
                                newValue = current
                                  .filter((item) => item !== value)
                                  .join(",");
                              }

                              if (!newValue) newValue = null;

                              updateFilters({ [specParam]: newValue });
                            }}
                            checked={(
                              searchParams[`spec_${spec.id}`]
                                ?.toString()
                                .split(",")
                                .filter(Boolean) || []
                            ).includes(value)}
                          />
                          <label
                            htmlFor={`spec-${spec.id}-${value}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {value}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
