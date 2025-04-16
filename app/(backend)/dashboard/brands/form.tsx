"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { updateBrandAction } from "@/lib/actions/Brand/update";
import { addBrand } from "@/lib/actions/Brand/post";
import { Brand } from "@/components/Product/Create/types";
import { brandSchema } from "@/lib/ZodSchemas/BrandSchema";

interface BrandFormProps {
  initialData?: Brand;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function BrandForm({
  initialData,
  onClose,
  onSuccess,
}: BrandFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    typeof initialData?.brand_image === "string"
      ? initialData.brand_image
      : null
  );

  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<Brand>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      brand_name: initialData?.brand_name || "",
      brand_image: undefined,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const onSubmit = async (data: Brand) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("brand_name", data.brand_name);
      if (data.brand_image instanceof File) {
        formData.append("brand_image", data.brand_image);
      }

      const result = initialData?.brand_id
        ? await updateBrandAction(initialData.brand_id.toString(), formData)
        : await addBrand(formData, { success: false, message: "" });

      if (result.success) {
        toast({
          title: "Success",
          description: initialData
            ? "Brand updated successfully"
            : "Brand created successfully",
        });
        onSuccess?.(); // Call success callback
      } else {
        throw new Error("Failed to process brand.");
      }
    } catch (error: any) {
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
      setValue("brand_image", file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Brand" : "Create New Brand"}</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="brandName">Brand Name</Label>
            <Input id="brandName" {...register("brand_name")} />
            {errors.brand_name && (
              <p className="text-red-500">{errors.brand_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="brandImage">Brand Image</Label>
            <Input
              id="brandImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {errors.brand_image && (
              <p className="text-red-500">{errors.brand_image.message}</p>
            )}
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

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Save Brand"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
