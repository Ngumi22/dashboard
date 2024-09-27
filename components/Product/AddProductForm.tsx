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

import { useFormState } from "react-dom";
import { X } from "lucide-react";
import { useRef } from "react";

import { FormSchema } from "@/lib/formSchema";
import { onSubmitAction } from "@/lib/formSubmit";

export const MailForm = () => {
  const [state, formAction] = useFormState(onSubmitAction, {
    message: "",
  });

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

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Form {...form}>
      {state && state.message !== "" && !state.issues && (
        <div className="text-red-500">{state.message}</div>
      )}
      {state && state.issues && (
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
      <form
        ref={formRef}
        className="space-y-8"
        action={formAction}
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit((data) => {
            console.log("Submitting form data:", data);
            if (formRef.current) {
              formAction(new FormData(formRef.current));
            } else {
              console.error("Form reference is not available.");
            }
          })(e);
        }}>
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
  );
};
