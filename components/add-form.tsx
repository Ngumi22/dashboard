"use client";

import { useState, useEffect } from "react";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { UploadFormProps } from "@/lib/definitions";

export default function UploadForm({
  initialData,
  onSubmit,
  isEdit,
}: UploadFormProps & { isEdit: boolean }) {
  const { toast } = useToast();

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<File[]>([]);
  const [productName, setProductName] = useState<string>(
    initialData?.name || ""
  );
  const [productSKU, setProductSKU] = useState<string>(initialData?.sku || "");
  const [productPrice, setProductPrice] = useState<string>(
    initialData?.price || ""
  );
  const [productQuantity, setProductQuantity] = useState<string>(
    initialData?.quantity || ""
  );
  const [productDiscount, setProductDiscount] = useState<string>(
    initialData?.discount || ""
  );
  const [productDescription, setProductDescription] = useState<string>(
    initialData?.description || ""
  );
  const [productCategory, setProductCategory] = useState<string>(
    initialData?.category || ""
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialData?.category || ""
  );
  const [productStatus, setProductStatus] = useState<
    "Archived" | "Active" | "Draft"
  >(initialData?.status || "Draft");

  const [productBrand, setProductBrand] = useState<string>(
    initialData?.brand || ""
  );

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const uniqueCategories = Array.from(
    new Set(categories.map((category) => category.name))
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !mainImage ||
      thumbnails.length !== 5 ||
      !productName ||
      !productSKU ||
      !productPrice ||
      !productQuantity ||
      !productDiscount ||
      !productDescription ||
      (!productCategory && !selectedCategory) ||
      !productStatus ||
      !productBrand
    ) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description:
          "Please upload one main image, five thumbnails, and fill all fields.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
      return;
    }

    const data = new FormData();
    data.append("main_image", mainImage);
    thumbnails.forEach((thumbnail, index) =>
      data.append(`thumbnail${index + 1}`, thumbnail)
    );
    data.append("name", productName);
    data.append("sku", productSKU);
    data.append("price", productPrice);
    data.append("quantity", productQuantity);
    data.append("discount", productDiscount);
    data.append("description", productDescription);
    data.append("category", productCategory || selectedCategory);
    data.append("status", productStatus);
    data.append("brand", productBrand);

    try {
      await onSubmit(data);

      const toastTitle = isEdit
        ? `Updating ${productName}`
        : "Adding New Product";
      toast({
        title: toastTitle,
        description: isEdit
          ? "Product Successfully updated"
          : `Product ${productName} successfully added`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.message || "Failed to submit the form. Please try again later.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

  const handleThumbnailChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const files = Array.from(e.target.files || []);
    setThumbnails((prev) => {
      const newThumbnails = [...prev];
      newThumbnails[index] = files[0];
      return newThumbnails;
    });
  };

  return (
    <section className="container my-8">
      <form onSubmit={handleSubmit}>
        <div className="flex justify-between">
          <div>
            <div className="grid w-full max-w-sm items-center gap-1.5 my-4">
              <Label htmlFor="name">Product Name</Label>
              <Input
                className="w-60"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5 my-4">
              <Label htmlFor="brand">Product Brand</Label>
              <Input
                className="w-60"
                type="text"
                value={productBrand}
                onChange={(e) => setProductBrand(e.target.value)}
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5 my-4">
              <Label htmlFor="sku">SKU</Label>
              <Input
                className="w-60"
                type="text"
                value={productSKU}
                onChange={(e) => setProductSKU(e.target.value)}
              />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 my-4">
              <Label htmlFor="price-1">Price</Label>
              <Input
                className="w-60"
                id="price-1"
                type="number"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
              />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 my-4">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                className="w-60"
                id="quantity"
                type="number"
                value={productQuantity}
                onChange={(e) => setProductQuantity(e.target.value)}
              />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 my-4">
              <Label htmlFor="discount">Discount</Label>
              <Input
                className="w-60"
                id="discount"
                type="number"
                value={productDiscount}
                onChange={(e) => setProductDiscount(e.target.value)}
              />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 my-4">
              <Label>Product Description</Label>
              <Textarea
                className="w-60"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
              />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 my-4">
              <p className="my-2">Category</p>
              <p>Select Existing Category</p>
              <Select
                value={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  setProductCategory(""); // Clear new category input when selecting existing category
                }}>
                <SelectTrigger className="w-60">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>

                <SelectContent>
                  {uniqueCategories.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="my-2">Or create new category</p>
              <Label htmlFor="category">Category</Label>
              <Input
                className="w-60"
                value={productCategory}
                onChange={(e) => {
                  setProductCategory(e.target.value);
                  setSelectedCategory(""); // Clear selected category when typing new category
                }}
              />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 my-4">
              <Label htmlFor="status">Status</Label>
              <select
                className="w-60"
                value={productStatus}
                onChange={(e) =>
                  setProductStatus(
                    e.target.value as "Archived" | "Active" | "Draft"
                  )
                }>
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="">
            <div className="flex w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="picture">Main Image</Label>
              <Input
                className="w-60"
                id="picture"
                type="file"
                name="main_image"
                onChange={(e) =>
                  setMainImage(e.target.files ? e.target.files[0] : null)
                }
              />
            </div>
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="flex w-full max-w-sm items-center gap-1.5 my-4">
                <Label htmlFor={`thumbnail${index}`}>
                  Thumbnail {index + 1}
                </Label>
                <Input
                  className="w-60"
                  id={`thumbnail${index}`}
                  type="file"
                  name={`thumbnail${index + 1}`}
                  onChange={(e) => handleThumbnailChange(e, index)}
                />
              </div>
            ))}
          </div>
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </section>
  );
}
