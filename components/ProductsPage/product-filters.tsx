"use client";

import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { PriceRangeSlider } from "./Slider";
import type { SearchParams } from "@/lib/actions/Product/search-params";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface ProductFiltersProps {
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

interface PriceFilter {
  min: number | null;
  max: number | null;
}

export function ProductFilters({
  availableFilters,
  currentFilters,
  setFilters,
}: ProductFiltersProps) {
  // State to track expanded filter sections
  const [expandedFilters, setExpandedFilters] = useState<
    Record<string, boolean>
  >({
    categories: false,
    brands: false,
  });

  // State to track whether to show all values for each specification
  const [showAllSpecs, setShowAllSpecs] = useState<Record<string, boolean>>({});

  // State to track whether to show all specifications
  const [showAllSpecifications, setShowAllSpecifications] = useState(false);

  const [localPriceFilter, setLocalPriceFilter] = useState<PriceFilter>({
    min: null, // Allow null values
    max: null, // Allow null values
  });

  // Local state for categories
  const [localCategories, setLocalCategories] = useState<string[]>(
    Array.isArray(currentFilters.category)
      ? currentFilters.category
      : currentFilters.category
      ? [currentFilters.category]
      : []
  );

  // Local state for brands
  const [localBrands, setLocalBrands] = useState<string[]>(
    Array.isArray(currentFilters.brand)
      ? currentFilters.brand
      : currentFilters.brand
      ? [currentFilters.brand]
      : []
  );

  // Local state for names
  const [localNames, setLocalNames] = useState<string>(
    currentFilters.name || ""
  );

  // Local state for specifications
  const [localSpecifications, setLocalSpecifications] = useState<
    Record<string, string[]>
  >(() => {
    const specs: Record<string, string[]> = {};
    availableFilters.specifications.forEach((spec) => {
      const specKey = spec.name.toLowerCase();
      specs[specKey] = Array.isArray(currentFilters[specKey])
        ? (currentFilters[specKey] as unknown[]).filter(
            (item): item is string => typeof item === "string"
          )
        : [];
    });
    return specs;
  });

  // Debounced local states
  const debouncedPriceFilter = useDebounce(localPriceFilter, 300);
  const debouncedCategories = useDebounce(localCategories, 300);
  const debouncedBrands = useDebounce(localBrands, 300);
  const debouncedNames = useDebounce(localNames, 300);
  const debouncedSpecifications = useDebounce(localSpecifications, 300);

  // Sync debounced states with URL
  useEffect(() => {
    setFilters({
      minPrice: debouncedPriceFilter.min ?? undefined,
      maxPrice: debouncedPriceFilter.max ?? undefined,
    });
  }, [debouncedPriceFilter, setFilters]);

  useEffect(() => {
    setFilters({
      category:
        debouncedCategories.length > 0 ? debouncedCategories : undefined,
    });
  }, [debouncedCategories, setFilters]);

  useEffect(() => {
    setFilters({
      brand: debouncedBrands.length > 0 ? debouncedBrands : undefined,
    });
  }, [debouncedBrands, setFilters]);

  useEffect(() => {
    setFilters({
      name: debouncedNames.length > 0 ? debouncedNames : undefined,
    });
  }, [debouncedNames, setFilters]);

  useEffect(() => {
    const updatedSpecs: Partial<SearchParams> = {};
    Object.entries(debouncedSpecifications).forEach(([key, values]) => {
      // Only add if there are selected values.
      if (values.length > 0) {
        // Format each value as "key:value".
        updatedSpecs[`spec_${key}`] = values.map((val) => `${key}:${val}`);
      } else {
        updatedSpecs[`spec_${key}`] = undefined;
      }
    });
    setFilters(updatedSpecs);
  }, [debouncedSpecifications, setFilters]);
  // Handle price range changes
  const handlePriceChange = (min: number, max: number) => {
    setLocalPriceFilter({ min, max });
  };

  // Handle category changes
  const handleCategoryChange = (categoryName: string) => {
    setLocalCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((cat) => cat !== categoryName)
        : [...prev, categoryName]
    );
  };

  // Handle brand changes
  const handleBrandChange = (brandName: string) => {
    setLocalBrands((prev) =>
      prev.includes(brandName)
        ? prev.filter((brand) => brand !== brandName)
        : [...prev, brandName]
    );
  };

  // Handle specification changes
  const handleSpecificationChange = (specKey: string, specValue: string) => {
    setLocalSpecifications((prev) => ({
      ...prev,
      [specKey]: prev[specKey].includes(specValue)
        ? prev[specKey].filter((val) => val !== specValue)
        : [...prev[specKey], specValue],
    }));
  };

  const resetFilters = () => {
    // Reset local states
    setLocalPriceFilter({
      min: null, // Reset to null to indicate no filters
      max: null, // Reset to null to indicate no filters
    });
    setLocalCategories([]);
    setLocalNames("");
    setLocalBrands([]);
    setLocalSpecifications(
      Object.fromEntries(
        availableFilters.specifications.map((spec) => [
          spec.name.toLowerCase(),
          [],
        ])
      )
    );

    // Reset URL filters immediately
    const resetData: Partial<SearchParams> = {
      minPrice: undefined, // Explicitly clear minPrice
      maxPrice: undefined, // Explicitly clear maxPrice
      category: undefined,
      brand: undefined,
      tags: undefined,
      search: undefined,
      sort: undefined,
      name: undefined,
    };

    // Clear specifications from URL
    availableFilters.specifications.forEach((spec) => {
      resetData[spec.name.toLowerCase()] = undefined;
    });

    // Update URL immediately
    setFilters(resetData);
  };

  // Helper to check if a category is selected
  const isCategorySelected = (categoryName: string) => {
    return localCategories.includes(categoryName);
  };

  // Helper to check if a brand is selected
  const isBrandSelected = (brandName: string) => {
    return localBrands.includes(brandName);
  };

  // Helper to count selected items
  const countSelectedCategories = () => localCategories.length;
  const countSelectedBrands = () => localBrands.length;
  const countSelectedSpecifications = (specKey: string) =>
    localSpecifications[specKey]?.length || 0;

  // Toggle show more/less for a filter group
  const toggleFilterExpand = (filterType: string) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  return (
    <div className="sticky top-20 h-fit rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="h-8 px-2">
          <X className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>
      <Accordion
        type="multiple"
        defaultValue={["price", "category", "brand"]}
        className="w-full">
        {/* Price Range Accordion */}
        <div className="mt-4 space-y-6">
          {/* Price Range Slider */}
          <div>
            <h4 className="text-sm font-medium">Price Range</h4>
            <PriceRangeSlider
              minPrice={availableFilters.minPrice}
              maxPrice={availableFilters.maxPrice}
              currentMin={localPriceFilter.min}
              currentMax={localPriceFilter.max}
              onChange={handlePriceChange}
            />
          </div>
        </div>

        <Separator className="my-2" />

        {/* Category Accordion */}
        <AccordionItem value="category">
          <AccordionTrigger>
            Category
            {countSelectedCategories() > 0 && (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {countSelectedCategories()}
              </span>
            )}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {availableFilters.categories
                .slice(0, expandedFilters.categories ? undefined : 5)
                .map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={isCategorySelected(category.name)}
                      onCheckedChange={() =>
                        handleCategoryChange(category.name)
                      }
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="cursor-pointer">
                      {category.name}
                    </Label>
                  </div>
                ))}

              {availableFilters.categories.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full text-xs"
                  onClick={() => toggleFilterExpand("categories")}>
                  {expandedFilters.categories ? (
                    <span className="flex items-center">
                      Show Less <ChevronUp className="ml-1 h-3 w-3" />
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Show More ({availableFilters.categories.length - 5} more){" "}
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </span>
                  )}
                </Button>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brand Accordion */}
        <AccordionItem value="brand">
          <AccordionTrigger>
            Brand
            {countSelectedBrands() > 0 && (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {countSelectedBrands()}
              </span>
            )}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {availableFilters.brands
                .slice(0, expandedFilters.brands ? undefined : 5)
                .map((brand) => (
                  <div key={brand.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand.id}`}
                      checked={isBrandSelected(brand.name)}
                      onCheckedChange={() => handleBrandChange(brand.name)}
                    />
                    <Label
                      htmlFor={`brand-${brand.id}`}
                      className="cursor-pointer">
                      {brand.name}
                    </Label>
                  </div>
                ))}

              {availableFilters.brands.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full text-xs"
                  onClick={() => toggleFilterExpand("brands")}>
                  {expandedFilters.brands ? (
                    <span className="flex items-center">
                      Show Less <ChevronUp className="ml-1 h-3 w-3" />
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Show More ({availableFilters.brands.length - 5} more){" "}
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </span>
                  )}
                </Button>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Specifications Accordion */}
        {availableFilters.specifications
          .slice(0, showAllSpecifications ? undefined : 5)
          .map((spec) => {
            const specKey = spec.name.toLowerCase(); // e.g. "storage"
            const showAllValues = showAllSpecs[`spec-${spec.id}`] || false;
            const selectedCount = countSelectedSpecifications(specKey);

            return (
              <AccordionItem key={spec.id} value={`spec-${spec.id}`}>
                <AccordionTrigger>
                  {spec.name}
                  {selectedCount > 0 && (
                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {selectedCount}
                    </span>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {spec.values
                      .slice(0, showAllValues ? undefined : 5)
                      .map((value) => (
                        <div
                          key={value}
                          className="flex items-center space-x-2">
                          <Checkbox
                            id={`spec-${spec.id}-${value}`}
                            checked={localSpecifications[specKey]?.includes(
                              value
                            )}
                            onCheckedChange={() =>
                              handleSpecificationChange(specKey, value)
                            }
                          />
                          <Label
                            htmlFor={`spec-${spec.id}-${value}`}
                            className="cursor-pointer">
                            {value}
                          </Label>
                        </div>
                      ))}

                    {spec.values.length > 5 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full text-xs"
                        onClick={() =>
                          setShowAllSpecs((prev) => ({
                            ...prev,
                            [`spec-${spec.id}`]: !showAllValues,
                          }))
                        }>
                        {showAllValues ? (
                          <span className="flex items-center">
                            Show Less <ChevronUp className="ml-1 h-3 w-3" />
                          </span>
                        ) : (
                          <span className="flex items-center">
                            Show More ({spec.values.length - 5} more){" "}
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </span>
                        )}
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}

        {/* Show more/less button for specifications */}
        {availableFilters.specifications.length > 5 && (
          <div className="mt-2 pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => setShowAllSpecifications(!showAllSpecifications)}>
              {showAllSpecifications ? (
                <span className="flex items-center justify-center">
                  Show Less <ChevronUp className="ml-1 h-3 w-3" />
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Show More ({availableFilters.specifications.length - 5} more){" "}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </span>
              )}
            </Button>
          </div>
        )}
      </Accordion>
    </div>
  );
}
