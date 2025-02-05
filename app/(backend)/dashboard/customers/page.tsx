"use client";

import Base64Image from "@/components/Data-Table/base64-image";
import { useToast } from "@/components/ui/use-toast";
import { Category } from "@/lib/actions/Category/catType";
import { fetchCategoryById } from "@/lib/actions/Category/fetch";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CategoryDetails({
  params,
}: {
  params: { id: number };
}) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!params?.id) {
      setError("No category ID provided.");
      setLoading(false);
      return;
    }

    const fetchCategory = async () => {
      try {
        const categoryData = await fetchCategoryById(params.id);
        if (categoryData) {
          setCategory(categoryData);
        } else {
          throw new Error("Category not found.");
        }
      } catch (err) {
        console.error("Error fetching category:", err);
        setError("Failed to load category details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [params?.id]);

  if (loading) {
    return <p>Loading category details...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button
          onClick={() => router.push("/dashboard/categories")}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Back to Categories
        </button>
      </div>
    );
  }

  if (!category) {
    return (
      <div>
        <p>Category not found.</p>
        <button
          onClick={() => router.push("/dashboard/categories")}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Back to Categories
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold">{category.category_name}</h1>
      {category.category_image && (
        <Base64Image
          src={String(category.category_image)}
          alt={category.category_name}
          width={100}
          height={100}
        />
      )}
      <p className="mt-4">
        <strong>Description:</strong> {category.category_description}
      </p>
      <p className="mt-2">
        <strong>Status:</strong>{" "}
        <span
          className={`px-2 py-1 rounded ${
            category.category_status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}>
          {category.category_status.charAt(0).toUpperCase() +
            category.category_status.slice(1)}
        </span>
      </p>
      <button
        onClick={() => router.push("/dashboard/categories")}
        className="mt-6 bg-blue-500 text-white px-4 py-2 rounded">
        Back to Categories
      </button>
    </div>
  );
}
