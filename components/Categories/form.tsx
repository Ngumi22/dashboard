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
import { updateCategory } from "@/lib/CategoryActions/updateCategory";
import Image from "next/image";
import { CategorySubmitAction } from "@/lib/CategoryActions/postActions";

interface CategoryFormProps {
  initialData?: Category;
  onCancel: () => void;
}

interface Category {
  category_id: number;
  category_name: string;
  category_image: string | File;
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
    category_image: initialData?.category_image || "",
    category_description: initialData?.category_description || "",
    status: initialData?.status || "active",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.category_image &&
      typeof initialData.category_image === "string"
      ? `data:image/jpeg;base64,${initialData.category_image}`
      : null
  );

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
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
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
    console.log("Category Data on Submit:", category);

    setIsSubmitting(true);

    const formData = new FormData();
    Object.entries(category).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    console.log("FormData Entries:", Array.from(formData.entries()));

    let result;
    if (!category.category_id) {
      // Creating a new category
      result = await CategorySubmitAction({ message: "" }, formData); // Replace this with your API function for creating categories
    } else {
      // Updating an existing category
      result = await updateCategory(category.category_id.toString(), formData);
    }

    setIsSubmitting(false);

    if (result) {
      toast({
        title: "Success",
        description: category.category_id
          ? "Category updated successfully"
          : "Category created successfully",
      });
      router.push("/dashboard/orders"); // Adjust route as needed
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: "Failed to process category",
        variant: "destructive",
      });
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
      <div>
        <Label htmlFor="category_image">Category Image</Label>
        <Input
          id="category_image"
          name="category_image"
          type="file"
          onChange={handleImageChange}
          accept="image/*"
        />
        {imagePreview && (
          <Image
            height={100}
            width={100}
            src={imagePreview}
            alt="Preview"
            className="mt-2 h-20 w-20 object-cover"
          />
        )}
      </div>
      <div>
        <Label htmlFor="category_description">Category Description</Label>
        <Textarea
          id="category_description"
          name="category_description"
          value={category.category_description}
          onChange={handleChange}
        />
      </div>
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
