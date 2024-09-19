"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useFormContext, Controller } from "react-hook-form";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

// File validation constants
const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB
const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Zod schema for image validation
const ImageSchema = z.object({
  mainImage: z
    .any()
    .refine(
      (files) =>
        files instanceof FileList &&
        files.length === 1 &&
        files[0].size <= MAX_FILE_SIZE,
      "Main image must be under 5MB."
    )
    .refine(
      (files) =>
        files instanceof FileList &&
        ACCEPTED_IMAGE_MIME_TYPES.includes(files[0].type),
      "Only .jpg, .jpeg, .png, and .webp formats are supported."
    ),
  thumbnailImages: z
    .any()
    .refine(
      (files) => files instanceof FileList && files.length <= 5,
      "You can upload up to 5 thumbnails."
    )
    .refine(
      (files) =>
        files instanceof FileList &&
        Array.from(files).every(
          (file) =>
            (file as File).size <= MAX_FILE_SIZE &&
            ACCEPTED_IMAGE_MIME_TYPES.includes((file as File).type)
        ),
      "Each thumbnail must be under 5MB and in the accepted formats."
    ),
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
  } = useFormContext(); // Use `useFormContext` for the parent form
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [thumbnailPreviews, setThumbnailPreviews] = useState<string[]>([]);

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const mainImageFile = files[0];
      setMainImagePreview(URL.createObjectURL(mainImageFile));
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const thumbnails = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setThumbnailPreviews(thumbnails);
    }
  };

  // Cleanup URL object when the component unmounts
  useEffect(() => {
    return () => {
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
      thumbnailPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [mainImagePreview, thumbnailPreviews]);

  return (
    <Card>
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
                  onChange={(e) => {
                    handleMainImageChange(e);
                    field.onChange(e.target.files); // Pass the file to the form state
                  }}
                />
              )}
            />
          </FormControl>
          {mainImagePreview && (
            <img
              src={mainImagePreview}
              alt="Main Image Preview"
              className="w-32 h-32 object-cover"
            />
          )}
          {errors.mainImage && <FormMessage />}
        </FormItem>

        {/* Thumbnails */}
        <FormItem>
          <FormLabel>Thumbnails</FormLabel>
          <FormControl>
            <Controller
              control={control}
              name="thumbnailImages"
              render={({ field }) => (
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    handleThumbnailChange(e);
                    field.onChange(e.target.files); // Pass the files to the form state
                  }}
                />
              )}
            />
          </FormControl>
          <div className="flex gap-2">
            {thumbnailPreviews.map((preview, index) => (
              <img
                key={index}
                src={preview}
                alt={`Thumbnail ${index + 1} Preview`}
                className="w-16 h-16 object-cover"
              />
            ))}
          </div>
          {errors.thumbnailImages && <FormMessage />}
        </FormItem>
      </CardContent>
    </Card>
  );
}
