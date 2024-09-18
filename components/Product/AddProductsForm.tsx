"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";
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
import AddSupplierForm from "./AddSupplier";
import AddSpecificationForm from "./AddSpecifications";
import AddTagsForm from "./AddTagsForm";

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
  mainImage: z
    .any()
    .refine(
      (files) => files?.length === 1 && files?.[0]?.size <= MAX_FILE_SIZE,
      {
        message: "Main image size should be less than 5MB",
      }
    )
    .refine((files) => ACCEPTED_IMAGE_MIME_TYPES.includes(files?.[0]?.type), {
      message: "Only .jpg, .jpeg, .png and .webp formats are supported.",
    }),
  thumbnailImages: z
    .array(z.any())
    .refine((files) => files?.length <= 5, {
      message: "Maximum 5 thumbnails are allowed.",
    })
    .refine(
      (files) =>
        files.every(
          (file) =>
            file.size <= MAX_FILE_SIZE &&
            ACCEPTED_IMAGE_MIME_TYPES.includes(file.type)
        ),
      "Each image should be less than 5MB and in the accepted formats."
    ),

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
      mainImage: null,
      thumbnailImages: [],
      categoryName: "",
      categoryImage: undefined,
      categoryDescription: "",
      brandName: "",
      brandImage: undefined,
      tags: [], // Default value for tags
    },
  });

  const [productTags, setProductTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState<string>("");
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [thumbnailPreviews, setThumbnailPreviews] = useState<string[]>([]);
  const [specificationsData, setSpecificationsData] = useState<any>(null);

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      form.setValue("mainImage", [file]);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleThumbnailChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const newThumbnails = [...form.getValues("thumbnailImages")];
      newThumbnails[index] = file;
      form.setValue("thumbnailImages", newThumbnails);

      const newPreviews = [...thumbnailPreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setThumbnailPreviews(newPreviews);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      form.setValue(e.target.name as any, files); // Update the form value
    }
  };

  const handleTagsChange = useCallback(
    (tags: string[]) => {
      console.log("Updating tags:", tags);
      form.setValue("tags", tags);
    },
    [form]
  );

  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  const handleSupplierChange = useCallback((supplier: any) => {
    setSelectedSupplier(supplier);
  }, []);
  const handleSpecificationsChange = useCallback((specification: any) => {
    setSpecificationsData(specification);
  }, []);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    const productData = {
      ...data,
      supplier: selectedSupplier,
      specification: specificationsData,
    };
    console.log("Submitted data: ", productData); // Log submitted data
    // Add your submit handling logic here, e.g., sending data to the backend
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">
            {JSON.stringify(productData, null, 2)}
          </code>
        </pre>
      ),
    });
  };
  // Cleanup URL object when the component unmounts
  useEffect(() => {
    return () => {
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
      thumbnailPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [mainImagePreview, thumbnailPreviews]);

  return (
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
                        <Input placeholder="Category Description" {...field} />
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

            <Card>
              <CardHeader>
                <CardTitle>Upload Main Image</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageChange}
                />
                {mainImagePreview && (
                  <div className="my-2 h-40">
                    <Image
                      src={mainImagePreview}
                      alt="Main Image Preview"
                      className="aspect-video w-full h-full rounded-md object-contain"
                      height={160}
                      width={160}
                    />
                  </div>
                )}
              </CardContent>

              <CardHeader>
                <CardTitle>Upload Thumbnails</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {[...Array(5)].map((_, index) => (
                    <div key={index}>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleThumbnailChange(e, index)}
                      />
                      {thumbnailPreviews[index] && (
                        <div className="my-2 h-24">
                          <Image
                            src={thumbnailPreviews[index]}
                            alt={`Thumbnail ${index + 1} Preview`}
                            className="w-full rounded-md object-contain aspect-video h-full"
                            height={96}
                            width={96}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <AddSpecificationForm
              onSpecificationsChange={handleSpecificationsChange}
            />
          </div>
        </div>

        <Button type="submit" className="w-auto">
          Submit
        </Button>
      </form>
    </Form>
  );
}