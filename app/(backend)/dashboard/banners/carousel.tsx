"use client";

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { createCarousel } from "@/lib/actions/Carousel/post";

interface CarouselFormProps {
  initialData?: {
    carousel_id?: number;
    title: string;
    short_description?: string;
    description?: string;
    link?: string;
    image?: File;
    status: "active" | "inactive";
    text_color: string;
    background_color: string;
  };
}

export interface Carousel {
  carousel_id?: number;
  title: string;
  short_description?: string;
  description?: string;
  link?: string;
  image?: File;
  status: "active" | "inactive";
  text_color: string;
  background_color: string;
}

export function CarouselForm({ initialData }: CarouselFormProps) {
  const [state, formAction] = useFormState(createCarousel, null);

  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (state?.success) {
      toast({
        title: "Success",
        description: state.message,
      });
    }

    if (state?.error) {
      toast({
        title: "Error",
        description: "Failed to save carousel. Please try again.",
        variant: "destructive",
      });
    }
  }, [state?.success, state?.error, state?.message, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? "Edit Carousel" : "Create New Carousel"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-8">
          {initialData?.carousel_id && (
            <input
              type="hidden"
              name="carousel_id"
              value={initialData.carousel_id}
            />
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={initialData?.title}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="short_description">Short Description</Label>
            <Textarea
              id="short_description"
              name="short_description"
              defaultValue={initialData?.short_description}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={initialData?.description}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Link to</Label>
            <Input
              id="link"
              name="link"
              type="url"
              defaultValue={initialData?.link}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="text_color">Text Colour</Label>
            <Input
              id="text_color"
              name="text_color"
              type="color"
              defaultValue={initialData?.text_color}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="background_color">Background Colour</Label>
            <Input
              id="background_color"
              name="background_color"
              type="color"
              defaultValue={initialData?.background_color}
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
                alt="Preview"
                className="mt-2 max-w-xs h-auto w-auto rounded-md"
              />
            )}
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <RadioGroup
              defaultValue={initialData?.status || "active"}
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
          <Button type="submit">Save Carousel</Button>
        </form>
      </CardContent>
    </Card>
  );
}
