"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import { X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
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
import { z } from "zod";
import { ProductSubmit } from "@/lib/product_submit";
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
import { Supplier } from "@/lib/types";
import AddProductImagesForm from "./AddProductImages";

const AddTagsForm = dynamic(() => import("./AddTagsForm"), { ssr: false });
const AddSpecificationForm = dynamic(() => import("./AddSpecifications"), {
  ssr: false,
});

export const ProductAdding = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [specificationsData, setSpecificationsData] = useState<any>([]);
  const [validatedImages, setValidatedImages] = useState<{
    mainImage: File | null;
    thumbnails: File[];
  }>({ mainImage: null, thumbnails: [] });
  const [state, formAction] = useFormState(ProductSubmit, {
    message: "",
  });

  const form = useForm<z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      price: 0,
      quantity: 0,
      discount: 0,
      status: "draft",
      tags: [],
      supplier: { supplier: null },
      categoryName: "",
      categoryImage: undefined,
      categoryDescription: "",
      mainImage: undefined,
      thumbnails: [],
      brandName: "",
      brandImage: undefined,
      specificationData: undefined,
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

  // Handle tag changes, updating the form field for 'tags'
  const handleTagsChange = useCallback(
    (tags: string[]) => {
      form.setValue("tags", tags); // Update the 'tags' field in the form state
    },
    [form]
  );

  const handleSupplierChange = useCallback(
    (supplier: Supplier | null) => {
      const supplierData = supplier
        ? {
            supplier: {
              supplier_id: supplier.supplier_id,
              name: supplier.name,
              contact_info: {
                phone: supplier.contact_info?.phone || "", // Default to an empty string if not available
                address: supplier.contact_info?.address || "", // Default to an empty string if not available
                email: supplier.contact_info?.email || "", // Default to an empty string if not available
              },
            },
          }
        : { supplier: null }; // This should match the expected structure

      form.setValue("supplier", supplierData); // Set structured supplier object
    },
    [form]
  );

  const handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();

    form.handleSubmit((data) => {
      const formData = new FormData(formRef.current!);

      // Get all form values
      const tags = form.getValues("tags");
      const supplier = form.getValues("supplier");

      // Append form values to formData
      formData.append("tags", JSON.stringify(tags)); // Serialize tags
      formData.append("supplier", JSON.stringify(supplier)); // Serialize supplier
      formData.append("specificationData", JSON.stringify(specificationsData)); // Append specifications

      // Append validated images (if available)
      if (validatedImages.mainImage) {
        formData.append("mainImage", validatedImages.mainImage);
      }
      validatedImages.thumbnails.forEach((thumbnail, index) => {
        formData.append(`thumbnail${index + 1}`, thumbnail);
      });

      console.log("Form Data before submission:", Object.fromEntries(formData));

      // Submit form data
      ProductSubmit({ message: "" }, formData).then((response) => {
        console.log("Server Response:", response); // Handle the server response if needed
      });
    })(evt);
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        className="space-y-8"
        action={formAction}
        onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormDescription>Product name.</FormDescription>
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
                <FormDescription>SKU.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Description</FormLabel>
              <FormControl>
                <Input placeholder="Enter product description" {...field} />
              </FormControl>
              <FormDescription>Product description.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormDescription>Price</FormDescription>
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
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormDescription>Quantity</FormDescription>
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
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormDescription>Discount</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/*  */}
        <AddProductImagesForm onImagesValidated={handleImageValidation} />
        <AddSpecificationForm
          onSpecificationsChange={setSpecificationsData} // Handle updates to specifications
        />
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

        <AddSupplierForm onSupplierChange={handleSupplierChange} />

        <Button type="submit">Submit</Button>
      </form>
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
    </Form>
  );
};
