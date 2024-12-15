"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { createBanner } from "@/lib/actions/Banners/post";
import { updateBannerAction } from "@/lib/actions/Banners/update";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().max(500).optional(),
  link: z.string().url().optional(),
  image: z
    .any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, "Max file size is 100MB.")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .png, and .webp formats are supported."
    )
    .optional(),
  text_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
  background_color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
  status: z.enum(["active", "inactive"]),
  usage_context: z.string().min(1, "Context is required"),
});

interface Banner {
  banner_id?: number;
  title: string;
  description?: string;
  link?: string;
  image?: string | File;
  text_color: string;
  background_color: string;
  usage_context: string;
  status: "active" | "inactive";
}

interface BannerFormProps {
  initialData?: Banner;
}

export default function BannerForm({ initialData }: BannerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    typeof initialData?.image === "string"
      ? `data:image/jpeg;base64,${initialData.image}`
      : null
  );

  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<Banner>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      link: initialData?.link || "",
      text_color: initialData?.text_color || "#000000",
      background_color: initialData?.background_color || "#FFFFFF",
      status: initialData?.status || "active",
      usage_context: initialData?.usage_context || "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const onSubmit = async (data: Banner) => {
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);

    const formData = new FormData();

    // Add banner data to FormData
    Object.entries(data).forEach(([key, value]) => {
      if (key === "image" && value instanceof File) {
        formData.append(key, value);
      } else if (key === "image" && initialData?.image) {
        formData.append("existing_image", initialData.image as string);
      } else {
        formData.append(key, value as string);
      }
    });

    try {
      const result = initialData?.banner_id
        ? await updateBannerAction(initialData.banner_id.toString(), formData)
        : await createBanner(formData);

      if (result) {
        toast({
          title: "Success",
          description: initialData
            ? "Banner updated successfully"
            : "Banner created successfully",
        });
        router.push("/dashboard/banners");
        router.refresh();
      } else {
        throw new Error("Failed to process banner.");
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
          {initialData ? "Edit Banner" : "Create New Banner"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p>{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="usage_context">Usage Context</Label>
            <Textarea id="usage_context" {...register("usage_context")} />
            {errors.usage_context && <p>{errors.usage_context.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link">Link to</Label>
            <Input id="link" type="url" {...register("link")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="text_color">Text Colour</Label>
            <Input id="text_color" type="color" {...register("text_color")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="background_color">Background Colour</Label>
            <Input
              id="background_color"
              type="color"
              {...register("background_color")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <Image
                src={imagePreview}
                alt="Preview"
                height={100}
                width={100}
                className="mt-2 object-cover"
              />
            )}
          </div>
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
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Banner"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
