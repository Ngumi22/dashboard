"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { string, z } from "zod";
import { submitProduct } from "@/lib/product_submit";
import { schema } from "@/lib/formSchema";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dynamic from "next/dynamic";
import AddSupplierForm from "./AddSupplier";
import AddProductImagesForm from "./AddProductImages";

const AddTagsForm = dynamic(() => import("./AddTagsForm"), { ssr: false });
const AddSpecificationForm = dynamic(() => import("./AddSpecifications"), {
  ssr: false,
});

import ImagePreview from "./ImagesPreview";

export const ProductAdding = () => {
  const [state, formAction] = useFormState(submitProduct, {
    message: "",
  });
  const formRef = useRef<HTMLFormElement>(null);
  const [specificationData, setSpecificationData] = useState<any>([]);
  const [supplierData, setSupplierData] = useState<any>([]);
  const [validatedImages, setValidatedImages] = useState<{
    mainImage: File | null;
    thumbnails: File[];
  }>({ mainImage: null, thumbnails: [] });

  const [brandImagePreview, setBrandImagePreview] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<File | null>(
    null
  );

  const brandImageInputRef = useRef<HTMLInputElement>(null);
  const categoryImageInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      price: 0, // Schema expects a number, 0 is valid
      quantity: 0, // Schema expects a number, 0 is valid
      discount: 0, // Schema expects a number, 0 is valid
      status: "draft", // Enum value, "draft" is valid
      tags: [], // Array, empty array is valid
      specificationData: undefined,

      supplier: { supplier: null },
      brand: {
        brandName: "",
        brandImage: null, // Change to null instead of undefined
      },
      category: {
        categoryName: "",
        categoryDescription: "",
        categoryImage: null, // Change to null instead of undefined
      },
      images: {
        mainImage: null, // Change to null instead of undefined
        thumbnails: [],
      },
      ...(state?.fields ?? {}),
    },
  });

  const handleTagsChange = useCallback(
    (tags: string[]) => {
      const uniqueTags = Array.from(new Set(tags));
      form.setValue("tags", uniqueTags);
    },
    [form]
  );
  const handleImagesValidated = (images: {
    mainImage: File | null;
    thumbnails: File[];
  }) => {
    setValidatedImages(images);
  };

  // Helper function to create imagesData object
  const createImagesData = () => {
    const imagesData = {
      mainImage: null as File | null,
      thumbnails: [] as File[], // Initialized as an empty array
    };

    // Assign the main image
    if (validatedImages.mainImage instanceof File) {
      imagesData.mainImage = validatedImages.mainImage;
    }

    // Assign the thumbnails
    validatedImages.thumbnails.forEach((thumbnail) => {
      if (thumbnail instanceof File) {
        imagesData.thumbnails.push(thumbnail);
      }
    });

    return imagesData;
  };
  const createCategoryData = (data: any) => {
    // Category
    const categoryData = {
      categoryName: data.category.categoryName,
      categoryDescription: data.category.categoryDescription,
      categoryImage:
        data.category.categoryImage instanceof File
          ? data.category.categoryImage.name
          : null, // Store file name
    };

    return categoryData;
  };

  const createBrandData = (data: any) => {
    // Brand
    const brandData = {
      brandName: data.brand.brandName,
      brandImage:
        data.brand.brandImage instanceof File
          ? data.brand.brandImage.name
          : null,
    };
    return brandData;
  };

  // handleSubmit function
  const handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();

    form.handleSubmit((data) => {
      const formData = new FormData(formRef.current!);

      // Basic fields
      formData.append("name", data.name);
      formData.append("sku", data.sku);
      formData.append("description", data.description);
      formData.append("status", data.status);
      formData.append("price", data.price.toString());
      formData.append("discount", data.discount?.toString() || "0");
      formData.append("quantity", data.quantity.toString());

      const brandData = createBrandData(data);
      formData.append(
        "brand",
        JSON.stringify({
          brandName: brandData.brandName,
          brandImage: brandData.brandImage,
        })
      );

      const categoryData = createCategoryData(data);
      formData.append("category", JSON.stringify(categoryData));

      const imagesData = createImagesData();
      formData.append(
        "images",
        JSON.stringify({
          mainImage: imagesData.mainImage?.name || null,
          thumbnails: imagesData.thumbnails.map((thumb) => thumb.name),
        })
      );

      formData.append("tags", JSON.stringify(data.tags));
      formData.append("supplier", JSON.stringify(supplierData));
      formData.append("specificationData", JSON.stringify(specificationData));

      console.log("Form Data before submission:", Object.fromEntries(formData));

      submitProduct({ message: "" }, formData).then((response) => {
        console.log("Server Response:", response);
      });
    })(evt);
  };

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xl font-bold">Adding Product Form</p>
      </div>
      <div>
        <Form {...form}>
          <div className="bg-white">
            {state?.message !== "" && !state.issues && (
              <div className="text-red-500">{state.message}</div>
            )}
            {state?.issues && (
              <div className="text-red-500">
                <ul>
                  {state.issues.map((issue) => (
                    <li key={issue} className="flex gap-1">
                      <X fill="red" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <form
            ref={formRef}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            action={formAction}
            onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter SKU" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter product description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value.toString()}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value.toString()}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value.toString()}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="">
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Status</FormLabel>
                      <Select
                        {...field}
                        value={field.value} // Controlled value
                        onValueChange={(value) => field.onChange(value)} // Update form state on change
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <AddTagsForm onTagsChange={handleTagsChange} />
            <AddSupplierForm onSupplierChange={setSupplierData} />

            <Card>
              <CardHeader>
                <CardTitle>Product Brand</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-2">
                <FormField
                  control={form.control}
                  name="brand.brandName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Brand Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand.brandImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Image</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          ref={brandImageInputRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              field.onChange(file);
                              setBrandImagePreview(file);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <ImagePreview
                  file={brandImagePreview}
                  altText="Brand"
                  onRemove={() => {
                    form.setValue("brand.brandImage", null);
                    setBrandImagePreview(null);
                    if (brandImageInputRef.current) {
                      brandImageInputRef.current.value = "";
                    }
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-2">
                <FormField
                  control={form.control}
                  name="category.categoryName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Category Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category.categoryDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Category Description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category.categoryImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Image</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          ref={categoryImageInputRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              field.onChange(file);
                              setCategoryImagePreview(file);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <ImagePreview
                  file={categoryImagePreview}
                  altText=""
                  onRemove={() => {
                    form.setValue("category.categoryImage", null);
                    setCategoryImagePreview(null);
                    if (categoryImageInputRef.current) {
                      categoryImageInputRef.current.value = "";
                    }
                  }}
                />
              </CardContent>
            </Card>

            <AddSpecificationForm
              onSpecificationsChange={setSpecificationData} // Handle updates to specifications
            />

            <AddProductImagesForm onImagesValidated={handleImagesValidated} />

            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </section>
  );
};
