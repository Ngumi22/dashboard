"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const allFilters = [
  {
    id: "price",
    name: "Price Range",
    type: "range",
    min: 0,
    max: 200000,
  },
  {
    id: "category",
    name: "Category",
    type: "checkbox",
    options: ["Smartphones", "Laptops", "Tablets", "Accessories"],
  },
  {
    id: "brand",
    name: "Brand",
    type: "checkbox",
    options: ["Apple", "Samsung", "Dell", "Lenovo", "HP"],
  },
  {
    id: "ram",
    name: "RAM",
    type: "checkbox",
    options: ["4GB", "8GB", "16GB", "32GB"],
  },
  {
    id: "storage",
    name: "Storage",
    type: "checkbox",
    options: ["64GB", "128GB", "256GB", "512GB", "1TB"],
  },
  {
    id: "processor",
    name: "Processor",
    type: "checkbox",
    options: ["Intel i3", "Intel i5", "Intel i7", "AMD Ryzen 5", "AMD Ryzen 7"],
  },
  {
    id: "screen_size",
    name: "Screen Size",
    type: "checkbox",
    options: ['13"', '14"', '15"', '17"'],
  },
];

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [openFilters, setOpenFilters] = useState<string[]>([
    "price",
    "category",
    "brand",
  ]);

  useEffect(() => {
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice && maxPrice) {
      setPriceRange([Number.parseInt(minPrice), Number.parseInt(maxPrice)]);
    }

    const active = allFilters
      .filter(
        (filter) =>
          searchParams.getAll(filter.id).length > 0 ||
          (filter.id === "price" && (minPrice || maxPrice))
      )
      .map((filter) => filter.id);

    if (JSON.stringify(active) !== JSON.stringify(activeFilters)) {
      setActiveFilters(active);
    }
  }, [searchParams, activeFilters]);

  const visibleFilters = showAllFilters ? allFilters : allFilters.slice(0, 6);

  const updateFilters = (filterId: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentValues = params.getAll(filterId);

    if (currentValues.includes(value)) {
      params.delete(filterId, value);
      setActiveFilters((prev) => prev.filter((f) => f !== filterId));
    } else {
      params.append(filterId, value);
      setActiveFilters((prev) => [...new Set([...prev, filterId])]);
    }

    router.push(`/products?${params.toString()}`);
  };

  const updatePriceRange = (values: number[]) => {
    setPriceRange(values);
    const params = new URLSearchParams(searchParams.toString());
    params.set("minPrice", values[0].toString());
    params.set("maxPrice", values[1].toString());
    setActiveFilters((prev) => [...new Set([...prev, "price"])]);
    router.push(`/products?${params.toString()}`);
  };

  const handlePriceInputChange = (index: number, value: string) => {
    const newValue = Number.parseInt(value);
    if (!isNaN(newValue)) {
      const newPriceRange = [...priceRange];
      newPriceRange[index] = newValue;
      updatePriceRange(newPriceRange);
    }
  };

  const toggleFilter = (filterId: string) => {
    setOpenFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  const clearAllFilters = () => {
    router.push("/products");
    setPriceRange([0, 2000]);
    setActiveFilters([]);
    setOpenFilters(["price", "category", "brand"]);
  };

  return (
    <Card className="w-full md:w-64 border border-gray-200 max-h-[calc(100vh-2rem)] overflow-auto">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" value={openFilters} className="w-full">
          {visibleFilters.map((filter) => (
            <AccordionItem value={filter.id} key={filter.id}>
              <AccordionTrigger onClick={() => toggleFilter(filter.id)}>
                {filter.name}
              </AccordionTrigger>
              <AccordionContent>
                {filter.type === "range" && (
                  <div className="space-y-4">
                    <Slider
                      min={filter.min}
                      max={filter.max}
                      step={1000}
                      value={priceRange}
                      onValueChange={updatePriceRange}
                      className="mt-2"
                    />
                    <div className="flex items-center space-x-1">
                      <Label htmlFor="minPrice">Min:</Label>
                      <Input
                        type="number"
                        id="minPrice"
                        value={priceRange[0]}
                        onChange={(e) =>
                          handlePriceInputChange(0, e.target.value)
                        }
                        className="w-20"
                      />
                      <Label htmlFor="maxPrice">Max:</Label>
                      <Input
                        type="number"
                        id="maxPrice"
                        value={priceRange[1]}
                        onChange={(e) =>
                          handlePriceInputChange(1, e.target.value)
                        }
                        className="w-20"
                      />
                    </div>
                  </div>
                )}
                {filter.type === "checkbox" && (
                  <div className="space-y-2">
                    {filter.options?.map((option) => (
                      <div key={option} className="flex items-center">
                        <Checkbox
                          id={`${filter.id}-${option}`}
                          checked={searchParams
                            .getAll(filter.id)
                            .includes(option)}
                          onCheckedChange={() =>
                            updateFilters(filter.id, option)
                          }
                        />
                        <label
                          htmlFor={`${filter.id}-${option}`}
                          className="ml-2 text-sm">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-4 space-y-2">
          {allFilters.length > 6 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowAllFilters(!showAllFilters)}>
              {showAllFilters ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Show More
                </>
              )}
            </Button>
          )}
        </div>
        <div className="mt-4 space-y-2">
          {activeFilters.length > 0 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={clearAllFilters}>
              Clear All Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
