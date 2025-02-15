"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  VariantFormValues,
  VariantSchema,
} from "@/lib/ZodSchemas/variantSchema";
import { saveVariant } from "@/lib/actions/Variants/post";
import { getSpecificationsForProduct } from "@/lib/actions/Specifications/fetch";

interface VariantFormProps {
  initialData?: VariantFormValues | null;
  productId: string;
  onSuccess?: () => void;
}

export const VariantForm = ({
  initialData,
  productId,
  onSuccess,
}: VariantFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [specifications, setSpecifications] = useState<
    { specification_id: number; specification_name: string }[]
  >([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<VariantFormValues>({
    resolver: zodResolver(VariantSchema),
    defaultValues: initialData || {
      product_id: productId,
      specification_id: 0,
      value: "",
      variant_price: 0,
      variant_quantity: 0,
      variant_status: "active",
      images: [],
    },
  });

  useEffect(() => {
    console.log("Product ID:", productId); // Debugging
    const fetchSpecifications = async () => {
      const specs = await getSpecificationsForProduct(productId);
      setSpecifications(specs);
    };

    fetchSpecifications();
  }, [productId]);

  const onSubmit = async (data: VariantFormValues) => {
    setError(null);
    setSuccess(null);

    // Convert images to Base64
    const imagePromises = images.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    const imageData = await Promise.all(imagePromises);

    const formData = {
      ...data,
      images: imageData.map((image) => ({
        image_data: image,
        image_type: "full" as "full" | "thumbnail", // Default to 'full' for now
      })),
    };

    const result = await saveVariant(formData);

    if ("error" in result) {
      setError(result.error);
    } else {
      setSuccess(result.success);
      reset(); // Reset the form after successful submission
      onSuccess?.(); // Trigger success callback (e.g., close modal or refresh data)
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Hidden field for variant_id */}
      <input type="hidden" {...register("variant_id")} />

      {/* Specification Dropdown */}
      <div>
        <label className="block text-sm font-medium">Specification</label>
        <select
          {...register("specification_id", { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2">
          <option value={0}>Select a specification</option>
          {specifications.map((spec) => (
            <option key={spec.specification_id} value={spec.specification_id}>
              {spec.specification_name}
            </option>
          ))}
        </select>
        {errors.specification_id && (
          <p className="text-sm text-red-500">
            {errors.specification_id.message}
          </p>
        )}
      </div>

      {/* Variant Value */}
      <div>
        <label className="block text-sm font-medium">Value</label>
        <input
          type="text"
          {...register("value")}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
        />
        {errors.value && (
          <p className="text-sm text-red-500">{errors.value.message}</p>
        )}
      </div>

      {/* Variant Price */}
      <div>
        <label className="block text-sm font-medium">Price</label>
        <input
          type="number"
          step="0.01"
          {...register("variant_price", { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
        />
        {errors.variant_price && (
          <p className="text-sm text-red-500">{errors.variant_price.message}</p>
        )}
      </div>

      {/* Variant Quantity */}
      <div>
        <label className="block text-sm font-medium">Quantity</label>
        <input
          type="number"
          {...register("variant_quantity", { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
        />
        {errors.variant_quantity && (
          <p className="text-sm text-red-500">
            {errors.variant_quantity.message}
          </p>
        )}
      </div>

      {/* Variant Status */}
      <div>
        <label className="block text-sm font-medium">Status</label>
        <select
          {...register("variant_status")}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {errors.variant_status && (
          <p className="text-sm text-red-500">
            {errors.variant_status.message}
          </p>
        )}
      </div>

      {/* Variant Images */}
      <div>
        <label className="block text-sm font-medium">Images</label>
        <input
          type="file"
          multiple
          onChange={(e) => setImages(Array.from(e.target.files || []))}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
        {initialData?.variant_id ? "Update Variant" : "Add Variant"}
      </button>

      {/* Error and Success Messages */}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-500">{success}</p>}
    </form>
  );
};
