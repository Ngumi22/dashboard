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
import { TagsInput } from "./AddTags";
import { useToast } from "@/components/ui/use-toast";
import { useCallback, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUniqueCategories } from "@/lib/actions/Category/fetch";
import { getUniqueBrands } from "@/lib/actions/Brand/fetch";
import { Label } from "@/components/ui/label";
import AddSpecifications from "./AddSpecs";
import AddSuppliers from "./AddSuppliers";

export interface Product {
  product_id: number;
  product_name: string;
  product_sku: string;
  product_description: string;
  product_price: number;
  product_quantity: number;
  product_discount: number;
  product_status: "draft" | "pending" | "approved";
  tags: string[];
  product_images: {
    main: string;
    thumbnails: string[];
  };
  category_id: string;
  brand: {
    brand_id: number;
    brand_name: string;
    brand_image: File | string | null | undefined;
  };
  specifications: {
    specification_name: string;
    specification_value: string;
    category_id: string;
  }[];
  suppliers: Supplier[];
}
export interface Supplier {
  supplier_id?: number;
  supplier_name?: string;
  supplier_email?: string;
  supplier_phone_number?: string;
  supplier_location?: string;
  isNew?: boolean;
}
export interface Category {
  category_id: string;
  category_name: string;
}

export interface Brand {
  brand_id: number;
  brand_name: string;
  brand_image: File | string | null;
}

export interface ProductFormProps {
  initialData?: Product | null;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Zod schema with enhanced validation
export const formSchema = z.object({
  product_id: z.number().optional().nullable(),
  category_id: z.string(),
  product_name: z
    .string()
    .min(2, { message: "Name is required and must be at least 2 characters." }),
  product_sku: z
    .string()
    .min(2, { message: "SKU is required and must be at least 2 characters." }),
  product_description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters." }),
  product_price: z.coerce
    .number()
    .min(0, { message: "Minimum price is 0" })
    .max(10000, { message: "Maximum price is 10000" }),
  product_quantity: z.coerce
    .number()
    .min(0, { message: "Minimum quantity is 0" })
    .max(1000, { message: "Maximum quantity is 1000" }),
  product_discount: z.coerce
    .number()
    .min(0, { message: "Minimum discount is 0" })
    .max(100, { message: "Maximum discount is 100" }),
  product_status: z.enum(["draft", "pending", "approved"]),
  tags: z
    .array(z.string().min(1, "Tag cannot be empty"))
    .min(1, "At least one tag is required")
    .max(5, "Maximum of 5 tags allowed"),

  brand: z.object({
    brand_id: z.number().optional().nullable(),
    brand_name: z.string().optional(),
    brand_image: z
      .instanceof(File)
      .refine((file) => file?.size <= MAX_FILE_SIZE, "Max image size is 5MB")
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
        "Only .jpg, .png, and .webp formats are supported"
      )
      .optional(),
  }),

  main_image: z
    .instanceof(File)
    .refine((file) => file?.size <= MAX_FILE_SIZE, "Max image size is 5MB")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .png, and .webp formats are supported"
    )
    .optional(),
  thumbnail_images: z
    .array(z.instanceof(File))
    .max(5, "Maximum 5 thumbnails allowed")
    .optional(),
  specifications: z.array(
    z.object({
      specification_name: z.string(),
      specification_value: z.string(),
      category_id: z.string(),
    })
  ),
  suppliers: z.array(
    z.object({
      supplier_id: z.number().optional(),
      supplier_name: z.string().optional(),
      supplier_email: z.string().email().optional(),
      supplier_phone_number: z.string().optional(),
      supplier_location: z.string().optional(),
      isNew: z.boolean().optional(),
    })
  ),
});

export type ProductFormValues = z.infer<typeof formSchema>;

export default function AddForm({ initialData }: ProductFormProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [existingBrands, setExistingBrands] = useState<Brand[]>([]);
  const [selectedBrandOption, setSelectedBrandOption] = useState<string>(
    initialData?.brand?.brand_id?.toString() || ""
  );
  const [specifications, setSpecifications] = useState<
    Product["specifications"]
  >(initialData?.specifications || []);
  const [suppliers, setSuppliers] = useState<Product["suppliers"]>(
    initialData?.suppliers || []
  );
  const [existingImages, setExistingImages] = useState<{
    main: string;
    thumbnails: string[];
  } | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          main_image: undefined,
          thumbnail_images: [],
          brand: {
            ...initialData.brand,
            brand_image:
              initialData.brand.brand_image instanceof File
                ? initialData.brand.brand_image
                : undefined,
          },
          specifications: initialData.specifications || [],
          suppliers: initialData.suppliers || [],
        }
      : {
          product_name: "",
          product_sku: "",
          product_description: "",
          product_price: 0,
          product_quantity: 0,
          product_discount: 0,
          product_status: "draft",
          category_id: "",
          tags: [],
          brand: { brand_id: null, brand_name: "", brand_image: undefined },
          specifications: [],
          suppliers: [],
        },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const fetchedBrands = await getUniqueBrands();
        const fetchedCategories = await getUniqueCategories();
        setCategories(
          fetchedCategories.map((category) => ({
            ...category,
            category_id: category.category_id.toString(),
          }))
        );
        setExistingBrands(fetchedBrands || []);
      } catch (error) {
        console.error("Failed to fetch brands:", error);
        setError("Failed to load brands. Please try again later.");
        setBrands([]); // Fallback to empty array in case of error
        setCategories([]); // Fallback to empty array in case of error
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    if (initialData) {
      setExistingImages(initialData.product_images);
      form.reset({
        ...initialData,
        main_image: undefined,
        thumbnail_images: [],
        brand: {
          ...initialData.brand,
          brand_image:
            initialData.brand.brand_image instanceof File
              ? initialData.brand.brand_image
              : undefined,
        },
      });
    }
  }, [initialData, form]);

  useEffect(() => {
    if (initialData?.brand) {
      setSelectedBrandOption(initialData.brand.brand_id.toString());
      form.setValue("brand", {
        ...initialData.brand,
        brand_image:
          initialData.brand.brand_image instanceof File
            ? initialData.brand.brand_image
            : undefined,
      });
    }
  }, [initialData, form]);

  const [previewImages, setPreviewImages] = useState<{
    main: string | null;
    thumbnails: string[];
  }>({
    main: initialData?.product_images.main || null,
    thumbnails: initialData?.product_images.thumbnails || [],
  });

  // Handle Main Image Preview
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewImages((prev) => ({
        ...prev,
        main: URL.createObjectURL(file),
      }));
      form.setValue("main_image", file);
    }
  };

  // Handle Thumbnail Images Preview
  const handleThumbnailImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      setPreviewImages((prev) => ({
        ...prev,
        thumbnails: files.map((file) => URL.createObjectURL(file)),
      }));
      form.setValue("thumbnail_images", files);
    }
  };

  const handleBrandOptionChange = (value: string) => {
    setSelectedBrandOption(value);
    if (value === "new") {
      form.setValue("brand", {
        brand_id: 0,
        brand_name: "",
        brand_image: undefined,
      });
    } else {
      const selectedBrand = existingBrands.find(
        (brand) => brand.brand_id.toString() === value
      );
      if (selectedBrand) {
        form.setValue("brand", {
          brand_id: selectedBrand.brand_id,
          brand_name: selectedBrand.brand_name,
          brand_image: undefined,
        });
      }
    }
  };

  const handleBrandImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("brand.brand_image", file);
    }
  };

  const handleSpecificationsChange = useCallback(
    (newSpecifications: Product["specifications"]) => {
      setSpecifications(newSpecifications);
      form.setValue("specifications", newSpecifications);
    },
    [form]
  );

  const handleSuppliersChange = useCallback(
    (newSuppliers: Product["suppliers"]) => {
      setSuppliers(newSuppliers);
      form.setValue("suppliers", newSuppliers);
    },
    [form]
  );
  async function onSubmit(data: ProductFormValues) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === "thumbnails") {
        (value as File[]).forEach((file) =>
          formData.append("thumbnails", file)
        );
      } else if (key === "brand") {
        if (
          typeof value === "object" &&
          value !== null &&
          "brand_id" in value
        ) {
          formData.append("brand_id", value.brand_id?.toString() || "");
        }
        if (
          typeof value === "object" &&
          value !== null &&
          "brand_name" in value
        ) {
          if (value?.brand_name) {
            formData.append("brand_name", value.brand_name);
          }
        }
        if (
          typeof value === "object" &&
          value !== null &&
          "brand_image" in value &&
          value.brand_image
        ) {
          formData.append("brand_image", value?.brand_image);
        }
      } else if (key === "specifications") {
        formData.append("specifications", JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value instanceof File ? value : value.toString());
      }
    });

    console.log(data);

    toast({
      title: "Product submitted successfully",
      description: `Product ${data.product_id ? "updated" : "created"}!`,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-8">
            <div className="flex items-center justify-center gap-4 border rounded-md p-2 space-y-2">
              {/* Hidden product_id field */}
              {initialData?.product_id && (
                <input
                  type="hidden"
                  name="product_id"
                  value={initialData.product_id}
                />
              )}
              <FormField
                control={form.control}
                name="product_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
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
                      <Input placeholder="SKU" {...field} />
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
                      <Input placeholder="Description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-center gap-4 border rounded-md p-2 space-y-2">
              <FormField
                control={form.control}
                name="product_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Price"
                        {...field}
                        type="number"
                        min={0}
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
                        placeholder="Quantity"
                        {...field}
                        type="number"
                        min={0}
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
                        placeholder="Discount"
                        {...field}
                        type="number"
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border rounded-md p-2 space-y-2">
              {/* Category Dropdown */}
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-24">
                        {categories.map((category) => (
                          <SelectItem
                            key={category.category_id}
                            value={category.category_id}>
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

            <div className="border rounded-md p-2 space-y-2">
              <AddSpecifications
                onSpecificationsChange={handleSpecificationsChange}
                initialSpecifications={specifications}
                selectedCategoryId={form.watch("category_id")}
              />
            </div>

            <div className="border rounded-md p-2 space-y-2">
              <div className="space-y-4 w-full mx-auto">
                <Select
                  onValueChange={handleBrandOptionChange}
                  value={selectedBrandOption}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingBrands.map((brand) => (
                      <SelectItem
                        key={brand.brand_id}
                        value={String(brand.brand_id)}>
                        {brand.brand_name}
                      </SelectItem>
                    ))}
                    <SelectItem value="new">Add New Brand</SelectItem>
                  </SelectContent>
                </Select>

                {selectedBrandOption === "new" && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="brand.brand_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Brand name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="brand.brand_image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Image</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              onChange={handleBrandImageChange}
                              accept="image/*"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {form.watch("brand.brand_image") && (
                      <div>
                        <Label>Image Preview</Label>
                        <div className="mt-2">
                          <Image
                            src={
                              form.watch("brand.brand_image")
                                ? URL.createObjectURL(
                                    form.watch("brand.brand_image") as Blob
                                  )
                                : "/placeholder.svg"
                            }
                            alt="Brand Preview"
                            width={100}
                            height={100}
                            className="h-20 w-20 object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedBrandOption && selectedBrandOption !== "new" && (
                  <div>
                    <Label>Selected Brand</Label>
                    <div className="mt-2 flex items-center space-x-4">
                      <span className="text-lg font-medium">
                        {existingBrands.find(
                          (b) => String(b.brand_id) === selectedBrandOption
                        )?.brand_name || "Unknown Brand"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Status Dropdown */}
            <div className="border rounded-md p-2 space-y-2">
              <FormField
                control={form.control}
                name="product_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="border rounded-md p-2 space-y-2">
              {/* Main Image Upload */}
              <FormField
                control={form.control}
                name="main_image"
                render={() => (
                  <FormItem>
                    <FormLabel>Main Image</FormLabel>
                    <FormControl>
                      <div className="gap-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageChange}
                        />
                        {previewImages.main && (
                          <Image
                            src={previewImages.main}
                            alt="Main Image Preview"
                            width={100}
                            height={100}
                            className="mt-2 h-20 w-20 object-cover"
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Thumbnail Images Upload */}
              <FormField
                control={form.control}
                name="thumbnail_images"
                render={() => (
                  <FormItem>
                    <FormLabel>Thumbnail Images (max 5)</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleThumbnailImagesChange}
                        />
                        <div className="flex gap-2 flex-wrap">
                          {previewImages.thumbnails.map((thumb, index) => (
                            <Image
                              key={index}
                              src={thumb}
                              alt={`Thumbnail ${index}`}
                              width={100}
                              height={100}
                              className="mt-2 h-16 w-16 object-cover"
                            />
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border rounded-md p-2 space-y-2">
              <AddSuppliers
                onSuppliersChange={handleSuppliersChange}
                initialSuppliers={suppliers}
              />
            </div>

            <div className="border rounded-md p-2 space-y-2">
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <TagsInput
                        initialTags={field.value}
                        onTagsChange={(tags) => field.onChange(tags)}
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="submit">
            {initialData ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
