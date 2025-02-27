"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { createBanner } from "@/lib/actions/Banners/post";
import { bannerSchema } from "@/lib/ZodSchemas/bannerschema";
import { fetchUsageContexts } from "@/lib/actions/Banners/fetch";
import { Banner } from "@/lib/actions/Banners/bannerType";
import { updateBannerAction } from "@/lib/actions/Banners/update";

export interface UsageContext {
  context_id: number | string;
  name: string;
}

interface BannerFormProps {
  initialData?: Banner;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function BannerForm({
  initialData,
  onClose,
  onSuccess,
}: BannerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    typeof initialData?.image === "string"
      ? `data:image/jpeg;base64,${initialData.image}`
      : null
  );
  const [usageContexts, setUsageContexts] = useState<UsageContext[]>([]);

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
      context_type: initialData?.usage_context_id ? "existing" : "new",
      usage_context_id: initialData?.usage_context_id
        ? Number(initialData.usage_context_id)
        : undefined,
      new_context_name: initialData?.usage_context_id
        ? ""
        : initialData?.new_context_name || "",
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

  const contextType = watch("context_type");

  useEffect(() => {
    const loadUsageContexts = async () => {
      try {
        const contexts = await fetchUsageContexts();
        setUsageContexts(contexts || []);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load usage contexts.",
          variant: "destructive",
        });
      }
    };
    loadUsageContexts();
  }, [toast]);

  useEffect(() => {
    if (initialData?.usage_context_id) {
      setValue("usage_context_id", initialData.usage_context_id);
      setValue("context_type", "existing");
    }
  }, [initialData, setValue]);

  const onSubmit = async (data: Banner) => {
    console.log("Form Data Submitted:", data);
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
      const result = initialData?.banner_id
        ? await updateBannerAction(initialData.banner_id.toString(), formData)
        : await createBanner(formData);

      console.log("Form Submission Result:", result);

      if (result.success) {
        toast({
          title: "Success",
          description: initialData
            ? "Banner updated successfully"
            : "Banner created successfully",
        });
        onSuccess?.();
        onClose?.();
      } else {
        throw new Error(result.message || "Failed to process banner.");
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

          {/* Usage Context */}
          <div className="space-y-2">
            <Label htmlFor="context_type">Usage Context</Label>
            <Controller
              name="context_type"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (value === "new") {
                      setValue("usage_context_id", "");
                    } else {
                      setValue("new_context_name", "");
                    }
                  }}
                  value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select context type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="existing">
                      Select Existing Context
                    </SelectItem>
                    <SelectItem value="new">Create New Context</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Existing Context or New Context */}
          {contextType === "existing" ? (
            <div className="space-y-2">
              <Label htmlFor="usage_context_id">Select Context</Label>
              <Controller
                name="usage_context_id"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value); // Convert to number
                      const matchedContext = usageContexts.find(
                        (context) => context.context_id === Number(value)
                      );
                      if (matchedContext) {
                        setValue("usage_context_name", matchedContext.name);
                      } else {
                        setValue("usage_context_name", "");
                      }
                    }}
                    value={String(field.value)} // Ensure value is a string for the Select component
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {field.value
                          ? usageContexts.find(
                              (context) =>
                                context.context_id === Number(field.value)
                            )?.name || "Invalid context"
                          : "Select a context"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {usageContexts.map((context) => (
                        <SelectItem
                          key={context.context_id}
                          value={String(context.context_id)} // Ensure value is a string
                        >
                          {context.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="new_context_name">New Context Name</Label>
              <Input id="new_context_name" {...register("new_context_name")} />
              {errors.new_context_name && (
                <p className="text-red-500">
                  {errors.new_context_name.message}
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Submitting..."
              : initialData
              ? "Update Banner"
              : "Create Banner"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
