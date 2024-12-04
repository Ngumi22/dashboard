"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import { Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { Textarea } from "../ui/textarea";
import { getUniqueCategories } from "@/lib/actions/Category/fetch";

const AddSuppliers = dynamic(() => import("./AddSuppliers"), {
  ssr: false,
});

type FormValues = z.infer<typeof NewProductSchema>;

interface Category {
  category_id: string;
  category_name: string;
  category_image: string;
  category_description: string;
}

export default function ProductsForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(SubmitAction, { message: "" });
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [thumbnailsPreview, setThumbnailsPreview] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      category_id: "",
      suppliers: [],
      specifications: [],
      ...(state?.fields ?? {}),
    },
  });

  const { register, watch, setValue } = form;
  const brandImageRef = form.register("brand_image");
  const mainImageRef = form.register("main_image");

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tags",
  });

  const selectedCategory = watch("category_id");

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const categories = await getUniqueCategories();
        setCategories(categories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setError("Failed to load categories. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    //console.log("Category changed to:", selectedCategory);
  }, [selectedCategory]);

  const onSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();
    form.handleSubmit((data: any) => {
      // console.log("Submitting form with category_id:", data.category_id);
      const formData = new FormData(formRef.current!);
      if (data.category_id && typeof data.category_id === "string") {
        formData.append("category_id", data.category_id);
      }
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
          const specWithCategory = {
            ...spec,
            category_id: selectedCategory, // Add the category_id here
          };
          formData.append(
            `specifications[${index}]`,
            JSON.stringify(specWithCategory)
          );
        });
      }
      // console.log("Specifications data: ", data.specifications);
      if (data.tags) {
        data.tags.forEach((tag: any, index: number) => {
          formData.append(`tags[${index}]`, JSON.stringify(tag));
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
    <section className="m-2">
      <h2 className="text-lg font-semibold my-4">Add a New Product</h2>
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
            <div className="space-y-2">
              {/* Product Information */}
              <div className="border p-4 rounded-md space-y-3 shadow">
                <h2>Product Information</h2>
                <div className="grid grid-flow-col gap-2">
                  <FormField
                    control={form.control}
                    name="product_name"
                    render={({ field }) => (
                      <FormItem>
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
                        <FormControl>
                          <Input placeholder="Enter SKU" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="product_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Product Description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Category Selection */}
              <div className="border p-4 rounded-md shadow">
                <h2 className="text-lg font-semibold">Category</h2>
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        value={field.value ? field.value.toString() : ""} // Ensure value is a string
                        onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.category_id}
                              value={category.category_id.toString()} // Ensure category_id is a string
                            >
                              {category.category_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Pricing */}
              <div className="border p-4 rounded-md shadow">
                <h2 className="text-lg font-semibold">Pricing</h2>
                <div className="grid grid-flow-col gap-4">
                  <FormField
                    control={form.control}
                    name="product_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Price"
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
                </div>
              </div>

              {/* Brand */}
              <div className="border p-4 rounded-md shadow">
                <h2>Brand</h2>
                <div className="grid grid-flow-col gap-3">
                  <FormField
                    control={form.control}
                    name="brand_name"
                    render={({ field }) => (
                      <FormItem>
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
                        <FormControl>
                          <Input
                            type="file"
                            placeholder="Brand Image"
                            {...brandImageRef}
                            onChange={(e) => {
                              field.onChange(e);
                              handleImageChange(setBrandImagePreview)(e);
                            }}
                          />
                        </FormControl>
                        {brandImagePreview && (
                          <Image
                            height={100}
                            width={100}
                            src={brandImagePreview}
                            alt="Brand Preview"
                            className="h-20 w-auto m-auto rounded object-contain"
                          />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Images */}
              <div className="grid grid-flow-col gap-3 border p-4 rounded-md shadow">
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
                        <Image
                          src={mainImagePreview}
                          alt="Main Preview"
                          className="h-36 w-full rounded"
                          height={100}
                          width={100}
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
                            <Image
                              src={preview}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-16 h-16 object-cover rounded"
                              height={100}
                              width={100}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-0 right-0 h-6 w-6"
                              onClick={() => removeThumbnail(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tags */}
              <div className="border p-4 rounded-md space-y-2 my-4 shadow">
                <h2>Products Tags</h2>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Input
                      {...register(`tags.${index}.value` as const)}
                      defaultValue={field.value}
                      placeholder="Enter tag"
                    />
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="destructive"
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
                  variant="secondary"
                  size="sm"
                  onClick={() => append({ value: "" })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tag
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Product Status */}
              <div className="border p-4 rounded-md space-y-5 shadow">
                <h2>Product Status</h2>
                <FormField
                  control={form.control}
                  name="product_status"
                  render={({ field }) => (
                    <FormItem>
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
              </div>

              {/* Specifications */}
              <AddSpecifications
                onSpecificationsChange={handleSpecificationsChange}
                selectedCategoryId={form.watch("category_id")}
              />

              {/* Suppliers */}
              <AddSuppliers
                onSuppliersChange={handleSuppliersChange}
                initialSuppliers={form.watch("suppliers")}
              />

              <Button type="submit" className="w-full">
                Submit Product
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
}
