"use client";

import { useState, useEffect, useRef } from "react";
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
import Image from "next/image";
import { X } from "lucide-react";

interface AddProductImagesFormProps {
  onImagesValidated: (images: {
    mainImage: File | null;
    thumbnails: File[];
  }) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const MAX_THUMBNAILS = 5;

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

  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const mainImageFile = files[0];

      // Validate file
      if (mainImageFile.size > MAX_FILE_SIZE) {
        alert("Main image size exceeds 5MB.");
        return;
      }
      if (!ACCEPTED_IMAGE_MIME_TYPES.includes(mainImageFile.type)) {
        alert("Invalid file type for main image.");
        return;
      }

      setMainImage(mainImageFile);
      setMainImagePreview(URL.createObjectURL(mainImageFile));

      onImagesValidated({ mainImage: mainImageFile, thumbnails });
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const thumbnailFiles = Array.from(files).filter((file) => {
        if (file.size > MAX_FILE_SIZE) {
          alert(`Thumbnail ${file.name} size exceeds 5MB.`);
          return false;
        }
        if (!ACCEPTED_IMAGE_MIME_TYPES.includes(file.type)) {
          alert(`Invalid file type for thumbnail ${file.name}.`);
          return false;
        }
        return true;
      });

      const newThumbnails = [...thumbnails, ...thumbnailFiles].slice(
        0,
        MAX_THUMBNAILS
      );
      setThumbnails(newThumbnails);

      const newPreviews = newThumbnails.map((file) =>
        URL.createObjectURL(file)
      );
      setThumbnailPreviews(newPreviews);

      onImagesValidated({ mainImage, thumbnails: newThumbnails });
    }
  };

  const removeMainImage = () => {
    setMainImage(null);
    setMainImagePreview(null);
    if (mainImageInputRef.current) {
      mainImageInputRef.current.value = "";
    }
    onImagesValidated({ mainImage: null, thumbnails });
  };

  const removeThumbnail = (index: number) => {
    const newThumbnails = thumbnails.filter((_, i) => i !== index);
    const newPreviews = thumbnailPreviews.filter((_, i) => i !== index);
    setThumbnails(newThumbnails);
    setThumbnailPreviews(newPreviews);

    // Update the FileList of the input
    if (thumbnailInputRef.current) {
      const dt = new DataTransfer();
      newThumbnails.forEach((file) => dt.items.add(file));
      thumbnailInputRef.current.files = dt.files;
    }

    onImagesValidated({ mainImage, thumbnails: newThumbnails });
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
                  ref={mainImageInputRef}
                  onChange={(e) => {
                    handleMainImageChange(e);
                    field.onChange(e.target.files); // Sync with form state
                  }}
                />
              )}
            />
          </FormControl>
          {mainImagePreview && (
            <div className="relative w-32 h-32">
              <Image
                src={mainImagePreview}
                alt="Main Image Preview"
                height={200}
                width={200}
                className="rounded-md h-auto w-auto"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-0 right-0 rounded-full"
                onClick={removeMainImage}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          {errors.mainImage && <FormMessage />}
        </FormItem>

        {/* Thumbnails */}
        <FormItem>
          <FormLabel>Thumbnails (Max 5)</FormLabel>
          <FormControl>
            <Controller
              control={control}
              name="thumbnailImages"
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
            {thumbnailPreviews.map((preview, index) => (
              <div key={index} className="relative w-16 h-16">
                <Image
                  src={preview}
                  alt={`Thumbnail ${index + 1} Preview`}
                  height={100}
                  width={100}
                  className="rounded-md h-auto w-auto"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-0 right-0 rounded-full"
                  onClick={() => removeThumbnail(index)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          {errors.thumbnailImages && <FormMessage />}
        </FormItem>
      </CardContent>
    </Card>
  );
}
