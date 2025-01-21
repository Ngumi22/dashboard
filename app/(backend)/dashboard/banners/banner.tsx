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
import { updateBannerAction } from "@/lib/actions/Banners/update";
import { bannerSchema } from "@/lib/ZodSchemas/bannerschema";
import { useStore } from "@/app/store";
import { fetchUsageContexts } from "@/lib/actions/Banners/fetch";
import { Banner } from "@/lib/actions/Banners/bannerType";

export interface UsageContext {
  context_id: number | string;
  name: string;
}

interface BannerFormProps {
  initialData?: Banner;
  onClose?: () => void;
}

export default function BannerForm({ initialData }: BannerFormProps) {
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
      usage_context_id: initialData?.usage_context_id || "",
      new_context_name: initialData?.usage_context_id
        ? ""
        : initialData?.new_context_name || "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = form;

  const contextType = watch("context_type");

  useEffect(() => {
    const loadUsageContexts = async () => {
      const contexts = await fetchUsageContexts();
      setUsageContexts(contexts || []);

      if (initialData?.usage_context_id) {
        setValue("usage_context_id", initialData.usage_context_id);
        setValue("context_type", "existing");
      }
    };
    loadUsageContexts();
  }, [initialData, setValue]);

  const onSubmit = async (data: Banner) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const formData = new FormData();

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
          {/* Other form fields remain unchanged */}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p>{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} />
            {errors.description && <p>{errors.description.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="link">Link to</Label>
            <Input id="link" type="url" {...register("link")} />
            {errors.link && <p>{errors.link.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="text_color">Text Colour</Label>
            <Input id="text_color" type="color" {...register("text_color")} />
            {errors.text_color && <p>{errors.text_color.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="background_color">Background Colour</Label>
            <Input
              id="background_color"
              type="color"
              {...register("background_color")}
            />
            {errors.background_color && (
              <p>{errors.background_color.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {errors.image && <p>{errors.image.message}</p>}
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
            {errors.status && <p>{errors.status.message}</p>}
          </div>

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

          {contextType === "existing" ? (
            <div className="space-y-2">
              <Label htmlFor="usage_context_id">Select Context</Label>
              <Controller
                name="usage_context_id"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      console.log("Selected context_id:", value); // Logs the selected context_id
                      field.onChange(value);

                      // Ensure value is a number to match against context_id
                      const matchedContext = usageContexts.find(
                        (context) => context.context_id === value
                      );

                      // Debugging log to check if the matched context is found
                      console.log("Matched context:", matchedContext);

                      if (matchedContext) {
                        // Update the field with the selected context name
                        setValue("usage_context_name", matchedContext.name); // Update context name
                      } else {
                        setValue("usage_context_name", ""); // Clear the name if not found
                      }
                    }}
                    value={field.value}>
                    <SelectTrigger>
                      <SelectValue>
                        <SelectValue>
                          {field.value
                            ? usageContexts.find(
                                (context) =>
                                  context.context_id === Number(field.value)
                              )?.name || "Invalid context"
                            : "Select a context"}
                        </SelectValue>
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                      {usageContexts.map((context) => (
                        <SelectItem
                          key={context.context_id}
                          value={String(context.context_id)}>
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
