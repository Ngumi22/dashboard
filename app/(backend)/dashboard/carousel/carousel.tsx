"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { carouselSchema } from "@/lib/ZodSchemas/CarouselSchema";
import { Carousel as OriginalCarousel } from "@/lib/actions/Carousel/carouselTypes";
import { updateCarouselAction } from "@/lib/actions/Carousel/update";
import { createCarousel } from "@/lib/actions/Carousel/add";

interface Carousel extends Omit<OriginalCarousel, "image"> {
  image?: string | File;
}

interface CarouselFormProps {
  initialData?: Carousel;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function CarouselForm({
  initialData,
  onClose,
  onSuccess,
}: CarouselFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    typeof initialData?.image === "string" ? initialData.image : null
  );

  const { toast } = useToast();

  const form = useForm<Carousel>({
    resolver: zodResolver(carouselSchema),
    defaultValues: {
      title: initialData?.title || "",
      short_description: initialData?.short_description || "",
      description: initialData?.description || "",
      link: initialData?.link || "",
      text_color: initialData?.text_color || "#000000",
      background_color: initialData?.background_color || "#FFFFFF",
      status: initialData?.status || "active",
      image: undefined,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isDirty },
  } = form;

  // console.log("Is Form Dirty?", isDirty);
  // console.log("Form Errors:", errors);

  const onSubmit = async (data: Carousel) => {
    // console.log("Form Data Submitted:", data);
    if (isSubmitting) return;
    setIsSubmitting(true);

    const formData = new FormData();

    // Append all fields to the form data
    Object.entries(data).forEach(([key, value]) => {
      if (key === "image" && value instanceof File) {
        formData.append(key, value);
      } else if (key === "image" && initialData?.image) {
        formData.append("existing_image", initialData.image as string);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    try {
      const result = initialData?.carousel_id
        ? await updateCarouselAction(
            initialData.carousel_id.toString(),
            formData
          )
        : await createCarousel(formData);

      if (result.success) {
        toast({
          title: "Success",
          description: initialData
            ? "Carousel updated successfully"
            : "Carousel created successfully",
        });
        onSuccess?.();
        onClose?.();
      } else {
        throw new Error(result.message || "Failed to process carousel.");
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.onerror = () =>
        toast({
          title: "Error",
          description: "Failed to preview the selected image.",
          variant: "destructive",
        });
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? "Edit Carousel" : "Create New Carousel"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="short_description">Description</Label>
            <Textarea
              id="short_description"
              {...register("short_description")}
            />
            {errors.short_description && (
              <p className="text-red-500">{errors.short_description.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} />
            {errors.description && (
              <p className="text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Link */}
          <div className="space-y-2">
            <Label htmlFor="link">Link to</Label>
            <Input id="link" type="url" {...register("link")} />
            {errors.link && (
              <p className="text-red-500">{errors.link.message}</p>
            )}
          </div>

          {/* Text Color */}
          <div className="space-y-2">
            <Label htmlFor="text_color">Text Colour</Label>
            <Input id="text_color" type="color" {...register("text_color")} />
            {errors.text_color && (
              <p className="text-red-500">{errors.text_color.message}</p>
            )}
          </div>

          {/* Background Color */}
          <div className="space-y-2">
            <Label htmlFor="background_color">Background Colour</Label>
            <Input
              id="background_color"
              type="color"
              {...register("background_color")}
            />
            {errors.background_color && (
              <p className="text-red-500">{errors.background_color.message}</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {errors.image && (
              <p className="text-red-500">{errors.image.message}</p>
            )}
            {imagePreview && (
              <Image
                src={imagePreview || "/placeholder.svg"}
                alt="Preview"
                height={100}
                width={100}
                className="mt-2 object-cover"
              />
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <RadioGroup
              onValueChange={(value: "active" | "inactive") =>
                setValue("status", value)
              }
              value={watch("status")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="active" />
                <Label htmlFor="active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inactive" id="inactive" />
                <Label htmlFor="inactive">Inactive</Label>
              </div>
            </RadioGroup>
            {errors.status && (
              <p className="text-red-500">{errors.status.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Submitting..."
              : initialData
                ? "Update Carousel"
                : "Create Carousel"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
