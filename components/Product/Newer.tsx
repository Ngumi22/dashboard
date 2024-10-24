"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import { Plus, Trash2, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewProductSchema } from "@/lib/ProductSchema";
import AddSpecifications from "./AddSpecs";
import Image from "next/image";
import dynamic from "next/dynamic";
import { SubmitAction } from "@/lib/productSubmit";
const AddSuppliers = dynamic(() => import("./AddSuppliers"), {
  ssr: false,
});

type FormValues = z.infer<typeof NewProductSchema>;

export function ProductsForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(SubmitAction, { message: "" });
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [thumbnailsPreview, setThumbnailsPreview] = useState<string[]>([]);
  const [categoryImagePreview, setCategoryImagePreview] = useState<
    string | null
  >(null);
  const [brandImagePreview, setBrandImagePreview] = useState<string | null>(
    null
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(NewProductSchema),
    defaultValues: {
      product_name: "",
      product_sku: "",
      product_description: "",
      product_price: 0,
      product_quantity: 0,
      product_discount: 0,
      product_status: "draft",
      tags: [{ value: "" }],
      thumbnails: [],
      main_image: undefined,
      brand_name: "",
      brand_image: undefined,
      category_name: "",
      category_description: "",
      category_image: undefined,
      suppliers: [],
      specifications: [],
      ...(state?.fields ?? {}),
    },
  });

  const { register } = form;
  const brandImageRef = form.register("brand_image");
  const categoryImageRef = form.register("category_image");
  const mainImageRef = form.register("main_image");

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tags",
  });

  const handleImageChange =
    (setter: React.Dispatch<React.SetStateAction<string | null>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setter(url);
      }
    };

  const handleThumbnailsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    const urls = files.map((file) => URL.createObjectURL(file));
    setThumbnailsPreview((prevPreviews) => [...prevPreviews, ...urls]);
    form.setValue("thumbnails", [...form.getValues("thumbnails"), ...files]);
  };

  const removeThumbnail = (index: number) => {
    setThumbnailsPreview((prevPreviews) =>
      prevPreviews.filter((_, i) => i !== index)
    );
    form.setValue(
      "thumbnails",
      form.getValues("thumbnails").filter((_, i) => i !== index)
    );
  };

  const onSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();
    form.handleSubmit((data: any) => {
      const formData = new FormData(formRef.current!);
      Object.keys(data).forEach((key) => {
        if (key !== "thumbnails") {
          formData.append(key, data[key]);
        }
      });
      if (data.thumbnails) {
        data.thumbnails.forEach((file: File) => {
          formData.append("thumbnails", file);
        });
      }
      if (data.suppliers) {
        data.suppliers.forEach((supplier: any, index: number) => {
          formData.append(`suppliers[${index}]`, JSON.stringify(supplier));
        });
      }
      if (data.specifications) {
        data.specifications.forEach((spec: any, index: number) => {
          formData.append(`specifications[${index}]`, JSON.stringify(spec));
        });
      }

      // Append tags if present
      if (data.tags) {
        data.tags.forEach((tag: any, index: number) => {
          formData.append(`tags[${index}]`, JSON.stringify(tag)); // Stringify each tag object
        });
      }

      SubmitAction({ message: "" }, formData).then((response) => {
        console.log("Server Response:", response);
      });
    })(evt);
  };

  const handleSpecificationsChange = useCallback(
    (
      specifications: {
        specification_name: string;
        specification_value: string;
        category_id: string;
      }[]
    ) => {
      if (
        JSON.stringify(specifications) !==
        JSON.stringify(form.getValues("specifications"))
      ) {
        form.setValue("specifications", specifications, {
          shouldValidate: true,
        });
      }
    },
    [form]
  );

  const handleSuppliersChange = useCallback(
    (suppliers: any[]) => {
      if (
        JSON.stringify(suppliers) !==
        JSON.stringify(form.getValues("suppliers"))
      ) {
        form.setValue("suppliers", suppliers, { shouldValidate: true });
      }
    },
    [form]
  );

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create Product</CardTitle>
        <CardDescription>
          Fill in the details to create a new product.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          {state?.message !== "" && !state.issues && (
            <div className="text-red-500 mb-4">{state.message}</div>
          )}
          {state?.issues && (
            <div className="text-red-500 mb-4">
              <ul>
                {state.issues.map((issue) => (
                  <li key={issue} className="flex items-center gap-2">
                    <X className="h-4 w-4" />
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
            onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="product_name"
                    render={({ field }) => (
                      <FormItem>
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
                    name="product_sku"
                    render={({ field }) => (
                      <FormItem>
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
                    name="product_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="product_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}>
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
                  <CardTitle>Pricing and Inventory</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="product_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="product_quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="product_discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
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
                  <CardTitle>Brand Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="brand_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter brand name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="brand_image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Image</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            {...brandImageRef}
                            onChange={(e) => {
                              field.onChange(e);
                              handleImageChange(setBrandImagePreview)(e);
                            }}
                          />
                        </FormControl>
                        {brandImagePreview && (
                          <Image
                            height={20}
                            width={20}
                            src={brandImagePreview}
                            alt="Brand Preview"
                            className="mt-2 object-contain rounded h-20 w-20"
                          />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="category_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter category name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter category description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category_image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Image</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            {...categoryImageRef}
                            onChange={(e) => {
                              field.onChange(e);
                              handleImageChange(setCategoryImagePreview)(e);
                            }}
                          />
                        </FormControl>
                        {categoryImagePreview && (
                          <img
                            src={categoryImagePreview}
                            alt="Category Preview"
                            className="mt-2 w-32 h-32 object-cover rounded"
                          />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="main_image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Image</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            {...mainImageRef}
                            onChange={(e) => {
                              field.onChange(e);
                              handleImageChange(setMainImagePreview)(e);
                            }}
                            className=""
                          />
                        </FormControl>
                        {mainImagePreview && (
                          <img
                            src={mainImagePreview}
                            alt="Main Preview"
                            className="mt-2 w-20 h-fit object-contain rounded mx-auto"
                          />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="thumbnails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thumbnail Images (up to 5)</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              handleThumbnailsChange(e);
                            }}
                          />
                        </FormControl>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {thumbnailsPreview.map((preview, index) => (
                            <div key={index} className="relative">
                              <img
                                src={preview}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-0 right-0 h-6 w-6"
                                onClick={() => removeThumbnail(index)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-center space-x-2">
                        <Input
                          {...register(`tags.${index}.value` as const)}
                          defaultValue={field.value}
                          placeholder="Enter tag"
                        />
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove tag</span>
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => append({ value: "" })}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Tag
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <AddSuppliers
                onSuppliersChange={handleSuppliersChange}
                initialSuppliers={form.watch("suppliers")}
              />

              <AddSpecifications
                onSpecificationsChange={handleSpecificationsChange}
              />
            </div>

            <Button type="submit" className="w-full">
              Submit Product
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
