"use client";

import { useState, useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  } = useFormContext();
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [thumbnailPreviews, setThumbnailPreviews] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<File[]>([]);

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const mainImageFile = files[0];
      setMainImage(mainImageFile);
      setMainImagePreview(URL.createObjectURL(mainImageFile));

      // Send updated main image to parent
      onImagesValidated({ mainImage: mainImageFile, thumbnails });
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const thumbnailFiles = Array.from(files);
      setThumbnails(thumbnailFiles);
      const previews = thumbnailFiles.map((file) => URL.createObjectURL(file));
      setThumbnailPreviews(previews);

      // Send updated thumbnails to parent
      onImagesValidated({ mainImage, thumbnails: thumbnailFiles });
    }
  };

  useEffect(() => {
    return () => {
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
      thumbnailPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [mainImagePreview, thumbnailPreviews]);

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
