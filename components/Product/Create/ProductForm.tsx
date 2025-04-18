"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { onSubmitAction } from "@/lib/actions/Product/add";
import { fetchCategoryWithSubCat } from "@/lib/actions/Category/fetch";
import AddSpecifications from "./AddSpecs";
import AddSuppliers from "./AddSuppliers";
import { getUniqueBrands } from "@/lib/actions/Brand/fetch";
import { Brand, Category, Product, ProductFormProps } from "./types";
import { updateProductAction } from "@/lib/actions/Product/update";

export default function ProductForm({ initialData }: ProductFormProps) {
  const [product, setProduct] = useState<Product>({
    product_id: initialData?.product_id || 0,
    product_name: initialData?.product_name || "",
    product_sku: initialData?.product_sku || "",
    product_description: initialData?.product_description || "",
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
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [isNewBrand, setIsNewBrand] = useState(false);
  const [existingBrands, setExistingBrands] = useState<Brand[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [newBrandName, setNewBrandName] = useState<string>("");
  const [newBrandImage, setNewBrandImage] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const fetchedBrands = await getUniqueBrands();
        const fetchedCategories = await fetchCategoryWithSubCat();
        setExistingBrands(fetchedBrands || []);
        setCategories(
          fetchedCategories.map((category) => ({
            ...category,
            category_id: category.category_id.toString(),
          }))
        );
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

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);

    if (value === "new") {
      setIsNewBrand(true);
      setSelectedBrandId(null);
      setNewBrandName("");
      setNewBrandImage(null);
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for numeric input fields
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Convert the value to a number (or default to 0 if invalid)
    const numericValue = parseFloat(value) || 0;

    // Update the state
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
  const handleStatusChange = (value: string) => {
    setProduct((prev) => ({
      ...prev,
      product_status: value as "pending" | "draft" | "approved",
    }));
  };

  const handleCategoryChange = (value: string) => {
    setProduct((prev) => ({ ...prev, category_id: value }));
  };

  const handleSpecificationsChange = useCallback(
    (specifications: Product["specifications"]) => {
      setProduct((prev) => ({ ...prev, specifications }));
    },
    []
  );

  const handleSuppliersChange = useCallback(
    (suppliers: Product["suppliers"]) => {
      setProduct((prev) => ({ ...prev, suppliers }));
    },
    []
  );

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

  const removeTag = (tagToRemove: string) => {
    setProduct((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const formData = new FormData();

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

    if (product.suppliers) {
      product.suppliers.forEach((supplier: any, index: number) => {
        formData.append(`suppliers[${index}]`, JSON.stringify(supplier));
      });
    }
    if (product.specifications) {
      product.specifications.forEach((spec: any, index: number) => {
        // Assuming you already have the category_id available
        const specWithCategory = {
          ...spec,
          category_id: product.category_id, // Add the category_id here
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

    // for (const [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }

    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      let result;

      if (!product.product_id) {
        result = await onSubmitAction({ message: "" }, formData);
        // console.log(`Inserting:`, result);
      } else {
        result = await updateProductAction(
          String(product.product_id),
          formData
        );
        // console.log(`Editing:`, result);
      }

      if (result) {
        toast({
          title: "Success",
          description: product.product_id
            ? "Product updated successfully"
            : "Product created successfully",
        });
        router.push("/dashboard/products");
        router.refresh();
      } else {
        throw new Error("Failed to process product.");
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="p-4 space-y-5">
      <Label className="font-bold text-2xl">
        {product.product_id ? "Update Product" : "Add Product"}
      </Label>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-8">
            {/* Product Details */}
            <div className="border rounded-md p-2">
              <Label className="font-semibold text-xl">Product Details</Label>

              <Input
                name="product_id"
                type="hidden"
                placeholder="id"
                value={product.product_id}
                onChange={handleNumberChange}
                required
              />
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Input
                  name="product_name"
                  placeholder="Product Name"
                  value={product.product_name}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="product_sku"
                  placeholder="SKU"
                  value={product.product_sku}
                  onChange={handleChange}
                  required
                />
                <Textarea
                  className="col-span-2"
                  name="product_description"
                  placeholder="Description"
                  value={product.product_description}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="border rounded-md p-2">
              <Label className="font-semibold text-xl">Product Pricing</Label>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <Input
                  name="product_price"
                  type="number"
                  placeholder="Price"
                  value={product.product_price}
                  onChange={handleNumberChange}
                  required
                />
                <Input
                  name="product_quantity"
                  type="number"
                  placeholder="Quantity"
                  value={product.product_quantity}
                  onChange={handleNumberChange}
                  required
                />
                <Input
                  name="product_discount"
                  type="number"
                  placeholder="Discount (%)"
                  value={product.product_discount}
                  onChange={handleNumberChange}
                />
              </div>
            </div>

            {/* Category Selection */}
            <div className="border rounded-md p-2 space-y-2">
              <Label htmlFor="category_id" className="font-semibold text-xl">
                Category
              </Label>
              <Select
                onValueChange={handleCategoryChange}
                defaultValue={product.category_id}>
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

            {/* Specifications */}
            <AddSpecifications
              onSpecificationsChange={handleSpecificationsChange}
              selectedCategoryId={product.category_id}
              initialSpecifications={product.specifications}
            />
          </div>

          <div className="space-y-8">
            {/* Status */}
            <div className="border rounded-md p-2 space-y-2">
              <Label htmlFor="product_status" className="font-semibold text-xl">
                Status
              </Label>
              <Select
                onValueChange={handleStatusChange}
                value={product.product_status}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Brand */}

            <div className="space-y-4 w-full mx-auto">
              <Select
                onValueChange={handleOptionChange}
                defaultValue={product.brand_id?.toString() || ""}>
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

              {selectedOption === "new" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="brand_name">Brand Name</Label>
                    <Input
                      name="brand_name"
                      placeholder="Brand name"
                      value={product.brand_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="brand_image">Brand Image</Label>
                    <Input
                      name="brand_image"
                      type="file"
                      onChange={handleBrandImageChange}
                      accept="image/*"
                      className=""
                    />
                  </div>
                  <div>
                    {product.brand_image && (
                      <div>
                        <Label>Image Preview</Label>
                        <div className="">
                          <Image
                            src={
                              typeof product.brand_image === "string"
                                ? `data:image/webp;base64,${product.brand_image}`
                                : URL.createObjectURL(product.brand_image)
                            }
                            alt="Brand Preview"
                            width={100}
                            height={100}
                            className="mt-2 h-20 w-20 object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {selectedOption && selectedOption !== "new" && (
                <div>
                  <Label>Selected Brand</Label>
                  <div className="mt-2 flex items-center space-x-4">
                    <span className="text-lg font-medium">
                      {existingBrands.find(
                        (b) => String(b.brand_id) === selectedOption
                      )?.brand_name || "Unknown Brand"}
                    </span>
                  </div>
                </div>
              )}
            </div>

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

            {/* Suppliers */}
            <AddSuppliers
              onSuppliersChange={handleSuppliersChange}
              initialSuppliers={product.suppliers}
            />

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

        {/* Buttons */}
        <div className="flex justify-end space-x-2">
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
    </section>
  );
}
