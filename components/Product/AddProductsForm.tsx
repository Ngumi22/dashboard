"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { toast } from "../ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback, useEffect, useState } from "react";

const AddSupplierForm = dynamic(() => import("./AddSupplier"), { ssr: false });
const AddSpecificationForm = dynamic(() => import("./AddSpecifications"), {
  ssr: false,
});
const AddTagsForm = dynamic(() => import("./AddTagsForm"), { ssr: false });
const AddProductImagesForm = dynamic(() => import("./AddProductImages"), {
  ssr: false,
});

const MAX_FILE_SIZE = 1024 * 1024 * 5;
const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export interface UploadFormProps {
  initialData?: any;
  onSubmit: (data: FormData) => Promise<void>;
  isEdit: boolean;
}

// Zod Schema
export const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  sku: z.string().min(2, {
    message: "SKU must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  price: z.number().positive({
    message: "Price must be a positive number greater than zero.",
  }),
  discount: z
    .number()
    .nonnegative({
      message: "Discount cannot be negative.",
    })
    .optional(),
  quantity: z.number().int().nonnegative({
    message: "Quantity cannot be negative.",
  }),
  status: z.enum(["draft", "pending", "approved"]),
  categoryName: z.string().min(2, {
    message: "Category must be at least 2 characters.",
  }),
  categoryDescription: z.string().min(2, {
    message: "Category must be at least 2 characters.",
  }),
  categoryImage: z
    .any()
    .refine((files) => {
      return files?.[0]?.size <= MAX_FILE_SIZE;
    }, `Max image size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_MIME_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
  brandName: z.string().min(2, {
    message: "Brand must be at least 2 characters.",
  }),

  brandImage: z
    .any()
    .refine((files) => {
      return files?.[0]?.size <= MAX_FILE_SIZE;
    }, `Max image size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_MIME_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),

  tags: z.array(z.string()).optional(),
});

// Form Component
export default function ProductForm() {
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [specificationsData, setSpecificationsData] = useState<any>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [validatedImages, setValidatedImages] = useState<{
    mainImage: File | null;
    thumbnails: File[];
  }>({ mainImage: null, thumbnails: [] });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      price: 0,
      discount: 0,
      quantity: 0,
      status: "draft",
      categoryName: "",
      categoryImage: undefined,
      categoryDescription: "",
      brandName: "",
      brandImage: undefined,
      tags: [], // Default value for tags
    },
  });

  const handleImageValidation = (images: {
    mainImage: File | null;
    thumbnails: File[];
  }) => {
    setValidatedImages(images); // Keep the original File objects
  };

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files?.length) {
        form.setValue(e.target.name as any, files); // Update the form value
      }
    },
    [form] // Ensure this function only updates when `form` changes
  );

  const handleTagsChange = useCallback(
    (tags: string[]) => {
      console.log("Updating tags:", tags);
      form.setValue("tags", tags);
    },
    [form]
  );

  const handleSupplierChange = useCallback((supplier: any) => {
    setSelectedSupplier(supplier);
  }, []);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      // Create a new FormData object
      const formData = new FormData();

      // Append text fields to FormData
      formData.append("name", data.name);
      formData.append("sku", data.sku);
      formData.append("description", data.description);
      formData.append("price", data.price.toString());
      formData.append("discount", data.discount?.toString() || "0"); // Handle optional discount
      formData.append("quantity", data.quantity.toString());
      formData.append("status", data.status);
      formData.append("categoryName", data.categoryName);
      formData.append("categoryDescription", data.categoryDescription);
      formData.append("brandName", data.brandName);

      // Append images (files) to FormData (if they exist)
      if (data.categoryImage && data.categoryImage[0]) {
        formData.append("categoryImage", data.categoryImage[0]);
      }
      if (data.brandImage && data.brandImage[0]) {
        formData.append("brandImage", data.brandImage[0]);
      }

      // Append supplier information if selected
      if (selectedSupplier) {
        formData.append("supplier", JSON.stringify(selectedSupplier));
      }

      // Append specifications
      formData.append("specifications", JSON.stringify(specificationsData));

      // Append tags if available
      if (data.tags && data.tags.length > 0) {
        data.tags.forEach((tag, index) => {
          formData.append(`tags[${index}]`, tag);
        });
      }

      // Append validated images (if available)
      if (validatedImages.mainImage) {
        formData.append("mainImage", validatedImages.mainImage);
      }
      validatedImages.thumbnails.forEach((thumbnail, index) => {
        formData.append(`thumbnail${index + 1}`, thumbnail);
      });

      // Send the FormData object to the backend
      const response = await fetch("/api/product", {
        method: "POST",
        body: formData, // Send the FormData directly
      });

      if (!response.ok) {
        throw new Error("Failed to submit product data");
      }

      const result = await response.json();
      console.log("Product added successfully:", result);

      // Optionally handle successful submission (e.g., redirect or show success message)
    } catch (error) {
      console.error("Error submitting product:", error);
      // Optionally handle error state (e.g., show an error message)
    }
  };

  return (
    <section>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Name Field */}

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Product Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* SKU Field */}
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="SKU" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description Field */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <AddTagsForm onTagsChange={handleTagsChange} />

                  {/* Price Field */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Price"
                            value={field.value.toString()} // Ensure it's a string
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            } // Convert to number
                            min={0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Discount Field */}
                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Discount"
                            value={field.value?.toString() ?? "0"} // Ensure it's a string
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            } // Convert to number
                            min={0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Quantity Field */}
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Quantity"
                            value={field.value.toString()} // Ensure it's a string
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            } // Convert to number
                            min={0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category Name Field */}

                  {/* Brand Name Field */}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Brand</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-2">
                  <FormField
                    control={form.control}
                    name="brandName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <Input placeholder="Brand Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormControl>
                    <Input
                      name="brandImage"
                      type="file"
                      onChange={handleFileChange} // Ensure file change is handled correctly
                    />
                  </FormControl>
                </CardContent>
              </Card>

              <AddSupplierForm onSupplierChange={handleSupplierChange} />
            </div>

            <div className="space-y-4">
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
              <Card>
                <CardHeader>
                  <CardTitle>Product Category</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-2">
                  <FormField
                    control={form.control}
                    name="categoryName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="Category Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Category Description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Category Image</FormLabel>

                    <FormControl>
                      <Input
                        name="categoryImage"
                        type="file"
                        onChange={handleFileChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </CardContent>
              </Card>

              <AddSpecificationForm
                onSpecificationsChange={setSpecificationsData} // Handle updates to specifications
              />

              <AddProductImagesForm onImagesValidated={handleImageValidation} />
            </div>
          </div>

          <Button type="submit" className="w-auto">
            Submit
          </Button>
        </form>
      </Form>

      <div>
        {submittedData && (
          <div className="mt-4">
            <h3 className="text-lg font-bold">Submitted Data:</h3>
            <pre className=" p-4 rounded">
              <code>{JSON.stringify(submittedData, null, 2)}</code>
            </pre>
          </div>
        )}
      </div>
    </section>
  );
}
