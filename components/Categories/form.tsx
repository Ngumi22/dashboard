"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import {
  CategorySubmitAction,
  updateCategoryAction,
} from "@/lib/actions/Category/server";

interface CategoryFormProps {
  initialData?: Category;
  onCancel: () => void;
}

interface Category {
  category_id: number;
  category_name: string;
  category_image: string | File | null;
  category_description: string;
  status: "active" | "inactive";
}

export default function CategoryForm({
  initialData,
  onCancel,
}: CategoryFormProps) {
  const [category, setCategory] = useState<Category>({
    category_id: initialData?.category_id || 0,
    category_name: initialData?.category_name || "",
    category_image: initialData?.category_image || null,
    category_description: initialData?.category_description || "",
    status: initialData?.status || "active",
  });

  const [existingImage, setExistingImage] = useState<string | null>(
    typeof initialData?.category_image === "string"
      ? `data:image/jpeg;base64,${initialData.category_image}`
      : null
  );

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCategory((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCategory((prev) => ({ ...prev, category_image: file }));
      setExistingImage(null); // Clear existing image if a new one is selected

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to preview the selected image.",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStatusChange = (value: string) => {
    setCategory((prev) => ({
      ...prev,
      status: value as "active" | "inactive",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);

    const formData = new FormData();

    // Append category data to FormData
    Object.entries(category).forEach(([key, value]) => {
      if (key === "category_image") {
        if (value instanceof File) {
          formData.append(key, value); // Add the new image if uploaded
        } else if (existingImage) {
          formData.append(
            "existing_image",
            initialData?.category_image as string
          ); // Pass the existing image
        }
      } else if (value !== null && value !== undefined) {
        formData.append(key, value as string);
      }
    });

    try {
      let result;
      if (!category.category_id) {
        // Create a new category
        result = await CategorySubmitAction({ message: "" }, formData);
      } else {
        // Update an existing category
        result = await updateCategoryAction(
          category.category_id.toString(),
          formData
        );
      }

      if (result) {
        toast({
          title: "Success",
          description: category.category_id
            ? "Category updated successfully"
            : "Category created successfully",
        });
        router.push("/dashboard/orders");
        router.refresh();
      } else {
        throw new Error("Failed to process category.");
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="hidden"
        name="category_id"
        value={category.category_id}
        onChange={(e) =>
          setCategory((prev) => ({
            ...prev,
            category_id: parseInt(e.target.value, 10) || 0,
          }))
        }
      />
      {/* Category Name */}
      <div>
        <Label htmlFor="category_name">Category Name</Label>
        <Input
          id="category_name"
          name="category_name"
          value={category.category_name}
          onChange={handleChange}
          required
        />
      </div>

      {/* Category Image */}
      <div>
        <Label htmlFor="category_image">Category Image</Label>
        <Input
          id="category_image"
          name="category_image"
          type="file"
          onChange={handleImageChange}
          accept="image/*"
        />
        {imagePreview ? (
          <Image
            height={100}
            width={100}
            src={imagePreview}
            alt="New Preview"
            className="mt-2 h-20 w-20 object-cover"
          />
        ) : existingImage ? (
          <Image
            height={100}
            width={100}
            src={existingImage}
            alt="Existing Preview"
            className="mt-2 h-20 w-20 object-cover"
          />
        ) : null}
      </div>

      {/* Category Description */}
      <div>
        <Label htmlFor="category_description">Category Description</Label>
        <Textarea
          id="category_description"
          name="category_description"
          value={category.category_description}
          onChange={handleChange}
        />
      </div>

      {/* Status */}
      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          onValueChange={handleStatusChange}
          defaultValue={category.status}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? category.category_id
              ? "Updating..."
              : "Creating..."
            : category.category_id
            ? "Update Category"
            : "Create Category"}
        </Button>
      </div>
    </form>
  );
}
