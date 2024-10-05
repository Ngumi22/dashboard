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
import AddProductImagesForm from "./AddProductImages";

const AddTagsForm = dynamic(() => import("./AddTagsForm"), { ssr: false });
const AddSpecificationForm = dynamic(() => import("./AddSpecifications"), {
  ssr: false,
});

export const ProductAdding = () => {
  const [state, formAction] = useFormState(ProductSubmit, {
    message: "",
  });
  const formRef = useRef<HTMLFormElement>(null);
  const [specificationsData, setSpecificationsData] = useState<any>([]);
  const [supplierData, setSupplierData] = useState<any>([]);
  const [validatedImages, setValidatedImages] = useState<{
    mainImage: File | null;
    thumbnails: File[];
  }>({ mainImage: null, thumbnails: [] });

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
      images: {
        mainImage: undefined,
        thumbnails: undefined,
      },
      brandName: "",
      brandImage: undefined,
      specificationData: undefined,
    },
  });

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
  const handleImagesValidated = (images: {
    mainImage: File | null;
    thumbnails: File[];
  }) => {
    setValidatedImages(images);
  };

  const handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();

    form.handleSubmit((data) => {
      const formData = new FormData(formRef.current!);
      formData.append("price", data.price.toString());
      formData.append("discount", data.discount?.toString() || "0"); // Handle optional discount
      formData.append("quantity", data.quantity.toString());

      // Get all form values
      const tags = form.getValues("tags");

      // Append form values to formData
      formData.append("tags", JSON.stringify(tags));
      formData.append("supplier", JSON.stringify(supplierData));
      formData.append("specificationData", JSON.stringify(specificationsData));

      // Prepare the images as JSON structure (filenames)
      const images = {
        mainImage: validatedImages.mainImage?.name || null, // Save file name for reference
        thumbnails: validatedImages.thumbnails.map((file) => file.name),
      };

      // Append images as JSON structure (filenames or references)
      formData.append("images", JSON.stringify(images)); // JSON of filenames

      console.log("Form Data before submission:", Object.fromEntries(formData));

      // Submit form data
      ProductSubmit({ message: "" }, formData).then((response) => {
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
            <AddProductImagesForm onImagesValidated={handleImagesValidated} />
            <AddSpecificationForm
              onSpecificationsChange={setSpecificationsData} // Handle updates to specifications
            />
            <AddSupplierForm onSupplierChange={setSupplierData} />
            <AddTagsForm onTagsChange={handleTagsChange} />
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
      </div>
    </section>
  );
};
