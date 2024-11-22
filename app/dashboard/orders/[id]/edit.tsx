"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import CategoryForm from "@/components/Categories/form";
import { updateCategoryAction } from "@/lib/CategoryActions/postActions";

interface Category {
  category_id: number;
  category_name: string;
  category_image: File; // Changed to string
  category_description: string;
  status: "active" | "inactive";
}

export default function EditCategory({
  params,
}: {
  params: { category_id: string };
}) {
  const { toast } = useToast();
  const [categoryData, setCategoryData] = useState<Category>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const category_id = params.category_id;
  const router = useRouter();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(`/api/category/${category_id}`);
        if (res.ok) {
          const category = await res.json();
          console.log(category);
          category.category_image = `data:image/jpeg;base64,${category.category.category_image}`;
          setCategoryData(category);
        } else {
          const errorText = await res.text();
          throw new Error(errorText || "Failed to fetch category");
        }
      } catch (error) {
        console.error("Error fetching category:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch category",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      } finally {
        setLoading(false);
      }
    };

    if (category_id) {
      fetchCategory();
    }
  }, [category_id, toast]);

  const handleSubmit = async (data: {
    category_name: string;
    category_image: string | File; // Allow both string and File
    category_description: string;
    status: "active" | "inactive";
  }) => {
    try {
      const formData = new FormData();
      formData.append("category_name", data.category_name);
      formData.append("category_description", data.category_description);
      formData.append("status", data.status);

      // Check if category_image is a File or a string
      if (data.category_image instanceof File) {
        formData.append("category_image", data.category_image);
      } else if (
        typeof data.category_image === "string" &&
        data.category_image.startsWith("data:image")
      ) {
        // If it's a base64 string, convert it to a file
        const response = await fetch(data.category_image);
        const blob = await response.blob();
        formData.append("category_image", blob, "image.jpg");
      }

      const response = await updateCategoryAction(category_id, formData);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update category");
      }

      toast({
        title: "Category Updated",
        description: "Category updated successfully!",
      });

      router.push("/dashboard/category");
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update category",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <>
      {categoryData ? (
        <CategoryForm
          initialData={{
            category_name: categoryData.category_name,
            category_description: categoryData.category_description,
            status: categoryData.status,
            category_image: categoryData.category_image, // This is now a file
          }}
          onSubmit={handleSubmit}
          isEdit={true}
        />
      ) : (
        <p>No category data available</p>
      )}
    </>
  );
}
