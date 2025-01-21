"use client";

import { useStore } from "@/app/store";
import Base64Image from "@/components/Data-Table/base64-image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CategoryDetails({
  params,
}: {
  params: { id: string };
}) {
  const fetchCategory = useStore((state) => state.fetchCategoryByIdState);
  const category = useStore((state) => state.selectedCategory);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const router = useRouter();

  useEffect(() => {
    fetchCategory(params.id);
  }, [fetchCategory]);

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
          src={category.category_image}
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
