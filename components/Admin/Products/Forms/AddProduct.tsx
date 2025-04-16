"use client";

import type React from "react";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  X,
  Info,
  DollarSign,
  Layers,
  FileText,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import AddSpecifications from "./AddSpecs";
import AddSuppliers from "./AddSuppliers";
import { fetchCategoryWithSubCat } from "@/lib/actions/Category/fetch";
import { getUniqueBrands } from "@/lib/actions/Brand/fetch";
import { updateProductAction } from "@/lib/actions/Product/update";
import type { Brand, Category, Product, ProductFormProps } from "./types";
import { onSubmitAction } from "@/lib/actions/Product/actions/post";
import RichTextEditor from "./Editor";

export default function ProductForm({ initialData }: ProductFormProps) {
  const [product, setProduct] = useState<Product>({
    product_id: initialData?.product_id || 0,
    product_name: initialData?.product_name || "",
    product_sku: initialData?.product_sku || "",
    product_description: initialData?.product_description || "",
    long_description: initialData?.long_description || "",
    product_price: initialData?.product_price || 0,
    product_quantity: initialData?.product_quantity || 0,
    product_discount: initialData?.product_discount || 0,
    product_status: initialData?.product_status || "draft",
    tags: initialData?.tags || [],
    main_image: initialData?.main_image || "",
    thumbnails: initialData?.thumbnails || [],
    brand_id: initialData?.brand_id || "",
    brand_name: initialData?.brand_name || "",
    brand_image: initialData?.brand_image || "",
    category_id: initialData?.category_id || "",
    suppliers: initialData?.suppliers || [],
    specifications: initialData?.specifications || [],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [isNewBrand, setIsNewBrand] = useState(false);
  const [existingBrands, setExistingBrands] = useState<Brand[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>("");

  const router = useRouter();
  const { toast } = useToast();

  // Fetch categories and brands on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const fetchedBrands = await getUniqueBrands();
        const fetchedCategories = await fetchCategoryWithSubCat();

        setExistingBrands(fetchedBrands || []);
        setCategories(
          fetchedCategories
            .filter((category) => category.parent_category_id !== null)
            .map((category) => ({
              ...category,
              category_id: category.category_id.toString(),
            }))
        );

        // Set selected option if we have a brand_id from initialData
        if (initialData?.brand_id) {
          setSelectedOption(initialData.brand_id.toString());
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [initialData]);

  // Handle brand selection change
  const handleOptionChange = (value: string) => {
    setSelectedOption(value);

    if (value === "new") {
      setIsNewBrand(true);
      setSelectedBrandId(null);
      setProduct((prev) => ({
        ...prev,
        brand_id: "",
        brand_name: "",
      }));
    } else {
      setIsNewBrand(false);
      setSelectedBrandId(Number(value));
      const selectedBrand = existingBrands.find(
        (brand) => String(brand.brand_id) === value
      );
      if (selectedBrand) {
        setProduct((prev) => ({
          ...prev,
          brand_id: selectedBrand.brand_id.toString(),
          brand_name: selectedBrand.brand_name,
        }));
      }
    }
  };

  // Handle text input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Handle rich text editor changes
  const handleRichTextChange = (value: string) => {
    console.log("Rich text changed:", value); // Add this line
    setProduct((prev) => ({ ...prev, long_description: value }));
  };

  // Handle numeric input fields
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = Number.parseFloat(value) || 0;
    setProduct((prev) => ({
      ...prev,
      [name]: numericValue,
    }));
  };

  // Handle main image change
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProduct((prev: any) => ({ ...prev, main_image: file }));
    }
  };

  // Handle brand image change
  const handleBrandImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProduct((prev: any) => ({ ...prev, brand_image: file }));
    }
  };

  // Handle thumbnail changes
  const handleThumbnailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setProduct((prev: any) => ({
      ...prev,
      thumbnails: files.slice(0, 5) as File[], // Limit to a maximum of 5 thumbnails
    }));
  };

  // Remove a thumbnail
  const removeThumbnail = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      thumbnails: prev.thumbnails.filter((_, i) => i !== index),
    }));
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    setProduct((prev) => ({
      ...prev,
      product_status: value as "pending" | "draft" | "approved",
    }));
  };

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setProduct((prev) => ({ ...prev, category_id: value }));
  };

  // Handle specifications change
  const handleSpecificationsChange = useCallback(
    (specifications: Product["specifications"]) => {
      setProduct((prev) => ({ ...prev, specifications }));
    },
    []
  );

  // Handle suppliers change
  const handleSuppliersChange = useCallback(
    (suppliers: Product["suppliers"]) => {
      setProduct((prev) => ({ ...prev, suppliers }));
    },
    []
  );

  // Add tag
  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !product.tags.includes(trimmedValue)) {
      setProduct((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedValue],
      }));
      setInputValue("");
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setProduct((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Handle key down for tag input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  // Form submission

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData();

    // Add all product fields to formData
    Object.entries(product).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          if (key === "thumbnails") {
            value.forEach((file) => formData.append("thumbnails", file));
          } else {
            formData.append(key, JSON.stringify(value));
          }
        } else if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Add suppliers to formData
    if (product.suppliers) {
      product.suppliers.forEach((supplier: any, index: number) => {
        formData.append(`suppliers[${index}]`, JSON.stringify(supplier));
      });
    }

    // Add specifications to formData
    if (product.specifications) {
      product.specifications.forEach((spec: any, index: number) => {
        const specWithCategory = {
          ...spec,
          category_id: product.category_id,
        };
        formData.append(
          `specifications[${index}]`,
          JSON.stringify(specWithCategory)
        );
      });
    }

    // Handle brand submission
    if (isNewBrand) {
      formData.append("brand_name", product.brand_name);
      if (product.brand_image) {
        formData.append("brand_image", product.brand_image);
      }
    } else if (selectedBrandId) {
      formData.append("brand_id", selectedBrandId.toString());
    }
    try {
      const result = product.product_id
        ? await updateProductAction(String(product.product_id), formData)
        : await onSubmitAction({ message: "" }, formData);

      // ✅ Corrected conditional (was using = instead of ===)
      if (result?.success || result?.message === "Product added successfully") {
        toast({
          title: "Success",
          description: product.product_id
            ? "Product updated successfully"
            : "Product submitted successfully",
        });
        router.push("/dashboard/products");
        router.refresh();
      } else {
        toast({
          title: "Failed",
          description: result?.message ?? "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("🔥 Error submitting product:", error);
      toast({
        title: "Error",
        description: error.message || "Unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading product data...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {product.product_id ? "Update Product" : "Create New Product"}
          </h2>
          <div className="flex items-center gap-2">
            <Select
              value={product.product_status}
              onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Input
            name="product_id"
            type="hidden"
            value={product.product_id}
            onChange={handleNumberChange}
          />

          {/* Essential Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Product Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-muted/10">
              <div className="space-y-2">
                <Label htmlFor="product_name">Product Name</Label>
                <Input
                  id="product_name"
                  name="product_name"
                  value={product.product_name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_sku">SKU</Label>
                <Input
                  id="product_sku"
                  name="product_sku"
                  value={product.product_sku}
                  onChange={handleChange}
                  placeholder="Enter product SKU"
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="product_description">Short Description</Label>
                <Textarea
                  id="product_description"
                  name="product_description"
                  value={product.product_description}
                  onChange={handleChange}
                  placeholder="Enter a brief product description"
                  rows={3}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="long_description">Long Description</Label>
                <RichTextEditor
                  value={product.long_description}
                  onChange={handleRichTextChange}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              {/* Pricing Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Pricing & Inventory</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border rounded-md bg-muted/10">
                  <div className="space-y-2">
                    <Label htmlFor="product_price">Price</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="product_price"
                        name="product_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={product.product_price}
                        onChange={handleNumberChange}
                        className="pl-8"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product_quantity">Quantity</Label>
                    <Input
                      id="product_quantity"
                      name="product_quantity"
                      type="number"
                      min="0"
                      value={product.product_quantity}
                      onChange={handleNumberChange}
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product_discount">Discount (%)</Label>
                    <Input
                      id="product_discount"
                      name="product_discount"
                      type="number"
                      min="0"
                      max="100"
                      value={product.product_discount}
                      onChange={handleNumberChange}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Category & Specifications */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    Category & Specifications
                  </h3>
                </div>
                <div className="p-4 border rounded-md bg-muted/10">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category_id">Category</Label>
                      <Select
                        value={product.category_id}
                        onValueChange={handleCategoryChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.category_id}
                              value={category.category_id.toString()}>
                              {category.category_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <Label className="text-base font-medium">
                        Specifications
                      </Label>
                      <AddSpecifications
                        onSpecificationsChange={handleSpecificationsChange}
                        selectedCategoryId={product.category_id}
                        initialSpecifications={product.specifications}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Suppliers */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Suppliers</h3>
                </div>
                <div className="p-4 border rounded-md bg-muted/10">
                  <AddSuppliers
                    onSuppliersChange={handleSuppliersChange}
                    initialSuppliers={product.suppliers}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Brand Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Brand Information</h3>
                </div>
                <div className="p-4 border rounded-md bg-muted/10">
                  <div className="space-y-4">
                    <Select
                      value={selectedOption}
                      onValueChange={handleOptionChange}>
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

                    {isNewBrand ? (
                      <div className="space-y-4 p-3 bg-muted/30 rounded-md">
                        <div className="space-y-2">
                          <Label htmlFor="brand_name">Brand Name</Label>
                          <Input
                            id="brand_name"
                            name="brand_name"
                            placeholder="Brand name"
                            value={product.brand_name}
                            onChange={handleChange}
                            required={isNewBrand}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="brand_image">Brand Image</Label>
                          <Input
                            id="brand_image"
                            name="brand_image"
                            type="file"
                            onChange={handleBrandImageChange}
                            accept="image/*"
                          />
                        </div>
                        {product.brand_image && (
                          <div className="mt-2">
                            <Label>Image Preview</Label>
                            <div className="mt-1">
                              <Image
                                src={
                                  typeof product.brand_image === "string"
                                    ? `data:image/webp;base64,${product.brand_image}`
                                    : URL.createObjectURL(product.brand_image)
                                }
                                alt="Brand Preview"
                                width={100}
                                height={100}
                                className="h-20 w-20 object-cover rounded-md"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : selectedOption ? (
                      <div className="mt-4">
                        <Label>Selected Brand</Label>
                        <div className="mt-2 p-3 bg-muted/30 rounded-md">
                          <span className="text-lg font-medium">
                            {existingBrands.find(
                              (b) => String(b.brand_id) === selectedOption
                            )?.brand_name || "Unknown Brand"}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Media Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Product Media</h3>
                </div>
                <div className="p-4 border rounded-md bg-muted/10">
                  <div className="space-y-6">
                    {/* Product Images */}
                    <div>
                      <Label>Main Image</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageChange}
                      />
                      {product.main_image && (
                        <div className="mt-2">
                          <Image
                            src={
                              typeof product.main_image === "string"
                                ? product.main_image
                                : URL.createObjectURL(product.main_image)
                            }
                            alt="Main Image Preview"
                            width={200}
                            height={200}
                            className="h-20 w-20 object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Thumbnails</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleThumbnailsChange}
                      />
                      <div className="mt-2 flex gap-2">
                        {(Array.isArray(product.thumbnails)
                          ? product.thumbnails.flatMap((t: any) =>
                              t instanceof File
                                ? t
                                : typeof t === "object"
                                  ? Object.values(t)
                                  : [t]
                            )
                          : []
                        ).map((thumbnail, index) => {
                          // Ensure we determine the correct image source
                          const thumbnailSrc =
                            thumbnail instanceof File
                              ? URL.createObjectURL(thumbnail) // Preview newly inserted files
                              : thumbnail; // Display base64-encoded images

                          return (
                            <div key={index} className="relative">
                              <Image
                                src={thumbnailSrc}
                                alt={`Thumbnail ${index + 1}`}
                                width={100}
                                height={100}
                                className="h-20 w-20 object-cover"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute top-0 right-0 p-1"
                                onClick={() => removeThumbnail(index)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="border rounded-md p-2 space-y-2">
                <Label className="text-xl font-semibold">Tags</Label>
                <Input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter a tag (press Enter or comma to add)"
                />
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(product?.tags) &&
                    product.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-sm py-1 px-2">
                        {tag}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-auto p-0"
                          onClick={() => removeTag(tag)}>
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/products")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? product.product_id
                  ? "Updating..."
                  : "Creating..."
                : product.product_id
                  ? "Update Product"
                  : "Create Product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
