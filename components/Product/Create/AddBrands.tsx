"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUniqueBrands } from "@/lib/actions/Brand/fetch";
import { Brand } from "./types";

export default function BrandSelector() {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [newBrandName, setNewBrandName] = useState<string>("");
  const [newBrandImage, setNewBrandImage] = useState<string | null>(null);
  const [existingBrands, setExistingBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
    if (value !== "new") {
      setNewBrandName("");
      setNewBrandImage(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const fetchedBrands = await getUniqueBrands();
        setExistingBrands(fetchedBrands || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setError("Failed to load categories. Please try again later.");
        setExistingBrands([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewBrandImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <Select onValueChange={handleOptionChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a brand" />
        </SelectTrigger>
        <SelectContent>
          {existingBrands.map((brand) => (
            <SelectItem key={brand.brand_id} value={String(brand.brand_id)}>
              {brand.brand_name}
            </SelectItem>
          ))}
          <SelectItem value="new">Add New Brand</SelectItem>
        </SelectContent>
      </Select>
      {selectedOption === "new" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="newBrandName">Brand Name</Label>
            <Input
              id="newBrandName"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder="Enter new brand name"
            />
          </div>
          <div>
            <Label htmlFor="newBrandImage">Brand Image</Label>
            <Input
              id="newBrandImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
          </div>
          {newBrandImage && (
            <div>
              <Label>Image Preview</Label>
              <div className="mt-2 relative w-32 h-32">
                <Image
                  src={newBrandImage}
                  alt="New brand preview"
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-md"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {selectedOption && selectedOption !== "new" && (
        <div>
          <Label>Selected Brand</Label>
          <div className="mt-2 flex items-center space-x-4">
            <div className="relative w-16 h-16">
              <Image
                src={(() => {
                  const selectedBrand = existingBrands.find(
                    (b) => String(b.brand_id) === selectedOption
                  );

                  const brandImage = selectedBrand?.brand_image;

                  if (typeof brandImage === "string") {
                    return brandImage; // A valid string URL
                  } else if (brandImage) {
                    return URL.createObjectURL(brandImage); // Convert File to URL
                  } else {
                    return "/fallback-image.png"; // Provide a fallback image
                  }
                })()}
                alt="Selected brand"
                fill
                style={{ objectFit: "cover" }}
                className="rounded-md"
              />
            </div>
            <span className="text-lg font-medium">
              {
                existingBrands.find(
                  (b) => String(b.brand_id) === selectedOption
                )?.brand_name
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
