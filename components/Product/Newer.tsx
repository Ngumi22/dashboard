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
  FormDescription,
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
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitAction } from "@/lib/productSubmit";
import { NewProductSchema } from "@/lib/ProductSchema";
import AddSpecifications from "./AddSpecs";
import AddSuppliers from "./AddSuppliers";

type FormValues = z.infer<typeof NewProductSchema>;

export const ProductsForm = () => {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction] = useFormState(SubmitAction, {
    message: "",
  });

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
      name: "",
      sku: "",
      description: "",
      price: 0,
      quantity: 0,
      discount: 0,
      status: "draft",
      tags: [{ value: "" }],
      thumbnails: [],
      mainImage: undefined,
      brandName: "",
      brandImage: undefined,
      categoryName: "",
      categoryDescription: "",
      categoryImage: undefined,
      suppliers: [],
      specifications: [],
      ...(state?.fields ?? {}),
    },
  });

  const { register } = form;
  const brandImageRef = form.register("brandImage");
  const categoryImageRef = form.register("categoryImage");
  const mainImageRef = form.register("mainImage");

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tags",
  });

  const {
    fields: supplierFields,
    append: appendSupplier,
    remove: removeSupplier,
  } = useFieldArray({
    control: form.control,
    name: "suppliers",
  });

  const {
    fields: specificationFields,
    append: appendSpecification,
    remove: removeSpecification,
  } = useFieldArray({
    control: form.control,
    name: "specifications",
  });

  // Handling image preview
  const handleMainImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMainImagePreview(url);
    }
  };

  const handleCategoryImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCategoryImagePreview(url);
    }
  };

  const handleBrandImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBrandImagePreview(url);
    }
  };

  const handleThumbnailsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    const urls = files.map((file) => URL.createObjectURL(file));
    setThumbnailsPreview(urls);
  };

  const onSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();
    form.handleSubmit((data: any) => {
      const formData = new FormData(formRef.current!);
      // Append other form fields
      Object.keys(data).forEach((key) => {
        if (key !== "thumbnails") {
          formData.append(key, data[key]);
        }
      });

      // Append thumbnails as multiple files
      if (data.thumbnails) {
        data.thumbnails.forEach((file: File) => {
          formData.append("thumbnails", file);
        });
      }

      // Append suppliers as an array (if it's an array in your form data)
      if (data.suppliers) {
        data.suppliers.forEach((supplier: any, index: number) => {
          formData.append(`suppliers[${index}]`, JSON.stringify(supplier));
        });
      }

      // Append specifications as an array (if it's an array in your form data)
      if (data.specifications) {
        data.specifications.forEach((spec: any, index: number) => {
          formData.append(`specifications[${index}]`, JSON.stringify(spec));
        });
      }
      SubmitAction({ message: "" }, formData).then((response) => {
        console.log("Server Response:", response);
      });
    })(evt);
  };

  const handleSpecificationsChange = useCallback(
    (
      specifications: { name: string; value: string; category_id: string }[]
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
    <Card className="space-y-4">
      <CardHeader>
        <CardTitle>Create Product</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
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
          <form
            ref={formRef}
            className="space-y-8"
            action={formAction}
            onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="h-fit">
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} />
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
                          <Input placeholder="" {...field} />
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle>Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            {...field}
                            value={field.value}
                            onValueChange={(value) => field.onChange(value)}>
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
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex flex-row gap-3 items-center">
                          <Input
                            className="my-2"
                            {...register(`tags.${index}.value` as const)} // Correctly registering the tag value
                            defaultValue={field.value} // ensures the value is controlled by react-hook-form
                          />
                          {index > 0 && (
                            <Button type="button" onClick={() => remove(index)}>
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        onClick={() => {
                          append({ value: "" }); // Append a new tag with an empty value
                        }}>
                        Add Tag
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Product Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AddSpecifications
                      onSpecificationsChange={handleSpecificationsChange}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Product Suppliers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AddSuppliers
                      onSuppliersChange={handleSuppliersChange}
                      initialSuppliers={form.watch("suppliers")}
                    />
                  </CardContent>
                </Card>
              </div>

              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>Product Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
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
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
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
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>Brand</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="brandName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Name</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="brandImage"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel>brandImage</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              {...brandImageRef}
                              onChange={(e) => {
                                field.onChange(e);
                                handleBrandImageChange(e);
                              }}
                            />
                          </FormControl>
                          {brandImagePreview && (
                            <div className="mt-2">
                              <img
                                src={brandImagePreview}
                                alt="Brand Image Preview"
                                className="w-32 h-32 object-cover"
                              />
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </CardContent>
              </Card>

              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>Category Name</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="categoryName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} />
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
                          <Input placeholder="" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="categoryImage"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel>Category Image</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              {...categoryImageRef}
                              onChange={(e) => {
                                field.onChange(e);
                                handleCategoryImageChange(e);
                              }}
                            />
                          </FormControl>
                          {categoryImagePreview && (
                            <div className="mt-2">
                              <img
                                src={categoryImagePreview}
                                alt="category Image Preview"
                                className="w-32 h-32 object-cover"
                              />
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                </CardHeader>

                <CardContent>
                  <FormField
                    control={form.control}
                    name="mainImage"
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
                              handleMainImageChange(e);
                            }}
                          />
                        </FormControl>
                        {mainImagePreview && (
                          <div className="mt-2">
                            <img
                              src={mainImagePreview}
                              alt="Main Image Preview"
                              className="w-32 h-32 object-cover"
                            />
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>

                <CardContent>
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
                              field.onChange(Array.from(e.target.files || []));
                              handleThumbnailsChange(e);
                            }}
                          />
                        </FormControl>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {thumbnailsPreview.map((preview, index) => (
                            <img
                              key={index}
                              src={preview}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-20 h-20 object-cover"
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
