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
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export default function UploadForm({
  initialData,
  onSubmit,
  isEdit,
}: UploadFormProps & { isEdit: boolean }) {
  const { toast } = useToast();
  const router = useRouter();

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(
    initialData?.main_image || null
  );
  const [thumbnails, setThumbnails] = useState<File[]>([]);
  const [thumbnailPreviews, setThumbnailPreviews] = useState<string[]>(
    initialData?.thumbnails || []
  );
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
      (!mainImage && !mainImagePreview) ||
      (thumbnailPreviews.length < 5 && thumbnails.length < 5) ||
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
    if (mainImage) {
      data.append("main_image", mainImage);
    }
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
        ? `Updating ${productName}...`
        : "Adding New Product";
      toast({
        title: toastTitle,
        description: isEdit
          ? "Product Successfully updated"
          : `Product ${productName} successfully added`,
      });

      router.push("/dashboard/products");
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
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const newThumbnails = [...thumbnails];
      newThumbnails[index] = file;
      setThumbnails(newThumbnails);

      const newPreviews = [...thumbnailPreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setThumbnailPreviews(newPreviews);

      // Reset file input value to allow reselecting the same file
      e.target.value = "";
    }
  };

  useEffect(() => {
    return () => {
      // Revoke object URLs on component unmount
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
      thumbnailPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [mainImagePreview, thumbnailPreviews]);

  return (
    <section className="container my-8">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>
                  Lipsum dolor sit amet, consectetur adipiscing elit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid w-full max-w-sm items-center gap-1.5 my-4">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    className=""
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5 my-4">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    className=""
                    type="text"
                    value={productSKU}
                    onChange={(e) => setProductSKU(e.target.value)}
                  />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5 my-4">
                  <Label>Product Description</Label>
                  <Textarea
                    className=""
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                  />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5 my-4">
                  <Label htmlFor="brand">Product Brand</Label>
                  <Input
                    className=""
                    type="text"
                    value={productBrand}
                    onChange={(e) => setProductBrand(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="my-4">
              <CardHeader>
                <CardTitle>Product Pricing</CardTitle>
                <CardDescription>
                  Lipsum dolor sit amet, consectetur adipiscing elit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid w-full max-w-sm items-center gap-1.5 my-4">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    className=""
                    id="price"
                    type="number"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                  />
                </div>

                <div className="grid w-full max-w-sm items-center gap-1.5 my-4">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    className=""
                    id="quantity"
                    type="number"
                    value={productQuantity}
                    onChange={(e) => setProductQuantity(e.target.value)}
                  />
                </div>

                <div className="grid w-full max-w-sm items-center gap-1.5 my-4">
                  <Label htmlFor="discount">Discount</Label>
                  <Input
                    className=""
                    id="discount"
                    type="number"
                    value={productDiscount}
                    onChange={(e) => setProductDiscount(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="grid w-full max-w-sm items-center gap-1.5 my-4">
              <CardHeader>
                <CardTitle>Product Category</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="grid gap-3">
                  <Label htmlFor="category">Select Category</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => {
                      setSelectedCategory(value);
                      setProductCategory(""); // Clear new category input when selecting existing category
                    }}>
                    <SelectTrigger className="">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>

              <CardContent>
                <Label htmlFor="subcategory">New Category</Label>
                <Input
                  className=""
                  type="text"
                  value={productCategory}
                  onChange={(e) => {
                    setProductCategory(e.target.value);
                    setSelectedCategory(""); // Clear selected category when entering a new category
                  }}
                  placeholder="Enter new category"
                />
              </CardContent>
            </Card>
            <Card x-chunk="dashboard-07-chunk-3">
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={productStatus}
                      onValueChange={(value) =>
                        setProductStatus(
                          value as "Archived" | "Active" | "Draft"
                        )
                      }>
                      <SelectTrigger className="">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Archived">Archived</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                Lipsum dolor sit amet, consectetur adipiscing elit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Upload Main Image</Label>
                <Input
                  className=""
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files ? e.target.files[0] : null;
                    if (file) {
                      setMainImage(file);
                      setMainImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
                <div className="my-2 h-40">
                  {mainImagePreview && (
                    <Image
                      src={mainImagePreview}
                      alt="Main Image Preview"
                      className="aspect-video w-full h-full rounded-md object-contain"
                      height="10"
                      width="10"
                    />
                  )}
                </div>
              </div>
            </CardContent>

            <CardContent>
              <Label>Upload Thumbnails</Label>
              <div className="grid grid-cols-3 gap-2">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="mb-2">
                    <Input
                      className=""
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleThumbnailChange(e, index)}
                    />

                    <div>
                      {thumbnailPreviews[index] && (
                        <div className="my-2 h-24">
                          <Image
                            src={thumbnailPreviews[index]}
                            alt={`Thumbnail ${index + 1} Preview`}
                            className="w-full rounded-md object-contain aspect-video h-full"
                            height="20"
                            width="20"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-center my-4">
          <Button type="submit" variant="outline">
            {isEdit ? "Update Product" : "Submit"}
          </Button>
        </div>
      </form>
    </section>
  );
}
