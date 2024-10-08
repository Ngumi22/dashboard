"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import ImagePreview from "./ImagesPreview";

// Define Zod schema for validation
const imageSchema = z.object({
  mainImage: z
    .instanceof(File)
    .nullable()
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB"
    )
    .refine(
      (file) =>
        !file || ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Invalid image type"
    ),
  thumbnails: z
    .array(
      z
        .instanceof(File)
        .refine(
          (file) => file.size <= 5 * 1024 * 1024,
          "File size must be less than 5MB"
        )
        .refine(
          (file) =>
            ["image/jpeg", "image/png", "image/webp"].includes(file.type),
          "Invalid image type"
        )
    )
    .max(5),
});

interface AddProductImagesFormProps {
  onImagesValidated: (images: {
    mainImage: File | null;
    thumbnails: File[];
  }) => void;
}

export default function AddProductImagesForm({
  onImagesValidated,
}: AddProductImagesFormProps) {
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext();
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<File[]>([]);

  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      const parsed = imageSchema.safeParse({ mainImage: file, thumbnails });
      if (!parsed.success) {
        alert(parsed.error.errors[0].message);
        return;
      }

      setMainImage(file);
      onImagesValidated({ mainImage: file, thumbnails });
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const newThumbnails = thumbnails.concat(files).slice(0, 5);
    const parsed = imageSchema.safeParse({
      mainImage,
      thumbnails: newThumbnails,
    });
    if (!parsed.success) {
      alert(parsed.error.errors[0].message);
      return;
    }

    setThumbnails(newThumbnails);
    onImagesValidated({ mainImage, thumbnails: newThumbnails });
  };

  const removeMainImage = () => {
    setMainImage(null);
    if (mainImageInputRef.current) mainImageInputRef.current.value = "";
    onImagesValidated({ mainImage: null, thumbnails });
  };

  const removeThumbnail = (index: number) => {
    const newThumbnails = thumbnails.filter((_, i) => i !== index);
    setThumbnails(newThumbnails);
    if (thumbnailInputRef.current) {
      const dt = new DataTransfer();
      newThumbnails.forEach((file) => dt.items.add(file));
      thumbnailInputRef.current.files = dt.files;
    }
    onImagesValidated({ mainImage, thumbnails: newThumbnails });
  };

  useEffect(() => {
    return () => {
      // Revoke all URLs when the component unmounts
      mainImage && URL.revokeObjectURL(mainImage as any);
      thumbnails.forEach((file) => URL.revokeObjectURL(file as any));
    };
  }, [mainImage, thumbnails]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Image */}
        <FormItem>
          <FormLabel>Main Image</FormLabel>
          <FormControl>
            <Controller
              control={control}
              name="mainImage"
              render={({ field }) => (
                <Input
                  type="file"
                  accept="image/*"
                  ref={mainImageInputRef}
                  onChange={(e) => {
                    handleMainImageChange(e);
                    field.onChange(e.target.files); // Sync with form state
                  }}
                />
              )}
            />
          </FormControl>
          {mainImage && (
            <ImagePreview
              file={mainImage}
              onRemove={removeMainImage}
              altText="Main Image"
            />
          )}
          {errors.mainImage && <FormMessage />}
        </FormItem>

        {/* Thumbnails */}
        <FormItem>
          <FormLabel>Thumbnails (Max 5)</FormLabel>
          <FormControl>
            <Controller
              control={control}
              name="thumbnails"
              render={({ field }) => (
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={thumbnailInputRef}
                  onChange={(e) => {
                    handleThumbnailChange(e);
                    field.onChange(e.target.files); // Sync with form state
                  }}
                />
              )}
            />
          </FormControl>
          <div className="flex flex-wrap gap-2">
            {thumbnails.map((file, index) => (
              <ImagePreview
                key={index}
                file={file}
                onRemove={() => removeThumbnail(index)}
                altText={`thumbnail`}
              />
            ))}
          </div>
          {errors.thumbnails && <FormMessage />}
        </FormItem>
      </CardContent>
    </Card>
  );
}
