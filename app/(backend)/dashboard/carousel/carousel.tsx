"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { createCarousel } from "@/lib/actions/Carousel/post";
import { useRouter } from "next/navigation";
import { updateCarouselAction } from "@/lib/actions/Carousel/update";

interface CarouselFormProps {
  initialData?: Carousel;
}

export interface Carousel {
  carousel_id?: number;
  title: string;
  short_description?: string;
  description?: string;
  link?: string;
  image?: string | File | Buffer | null;
  status: "active" | "inactive";
  text_color: string;
  background_color: string;
}

export function CarouselForm({ initialData }: CarouselFormProps) {
  const [carousel, setCarousel] = useState<Carousel>({
    carousel_id: initialData?.carousel_id || 0,
    title: initialData?.title || "",
    short_description: initialData?.short_description || "",
    description: initialData?.description || "",
    link: initialData?.link || "",
    text_color: initialData?.text_color || "",
    background_color: initialData?.background_color || "",
    status: initialData?.status || "active",
    image: initialData?.image || null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(
    typeof initialData?.image === "string"
      ? `data:image/jpeg;base64,${initialData.image}`
      : null
  );

  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCarousel((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCarousel((prev) => ({ ...prev, image: file }));
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

  const handleStatusChange = (value: "active" | "inactive") => {
    setCarousel((prev) => ({ ...prev, status: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const formData = new FormData();

    Object.entries(carousel).forEach(([key, value]) => {
      if (key === "image" && value instanceof File) {
        formData.append(key, value);
      } else if (key === "image" && value && typeof value === "string") {
        formData.append("existing_image", value);
      } else if (value !== null && value !== undefined) {
        formData.append(key, value as string);
      }
    });

    try {
      const result = carousel.carousel_id
        ? await updateCarouselAction(carousel.carousel_id.toString(), formData)
        : await createCarousel({ message: "" }, formData);

      if (result) {
        toast({
          title: "Success",
          description: carousel.carousel_id
            ? "Carousel updated successfully"
            : "Carousel created successfully",
        });
        router.push("/dashboard/carousel");
        router.refresh();
      } else {
        throw new Error("Failed to process carousel.");
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Input type="hidden" name="carousel_id" value={carousel.carousel_id} />

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={carousel.title}
          required
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="short_description">Short Description</Label>
        <Textarea
          id="short_description"
          name="short_description"
          value={carousel.short_description}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={carousel.description}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="link">Link</Label>
        <Input
          id="link"
          name="link"
          type="url"
          value={carousel.link}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="text_color">Text Color</Label>
        <Input
          id="text_color"
          name="text_color"
          type="color"
          value={carousel.text_color}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="background_color">Background Color</Label>
        <Input
          id="background_color"
          name="background_color"
          type="color"
          value={carousel.background_color}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        <Input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {imagePreview && (
          <Image
            height={100}
            width={100}
            src={imagePreview}
            alt="Image Preview"
            className="mt-2 h-20 w-20 object-cover"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <RadioGroup
          onValueChange={handleStatusChange}
          value={carousel.status}
          name="status">
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
        {isSubmitting ? "Saving..." : "Save Carousel"}
      </Button>
    </form>
  );
}
