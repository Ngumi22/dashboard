"use client";

import { useState } from "react";
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
import { SubmitAction } from "@/lib/productSubmit";
import { updateProduct } from "@/lib/ProductActions/UpdateProduct";

interface ProductFormProps {
  initialData?: Product;
  onCancel: () => void;
}

interface Product {
  product_id: string;
  product_name: string;
  product_sku: string;
  product_description: string;
  product_price: number;
  product_quantity: number;
  product_discount: number;
  product_status: "draft" | "active" | "inactive";
  tags: { value: string }[];
  thumbnails: File[];
  main_image: File | undefined;
  brand_name: string;
  brand_image: File | undefined;
  category_id: string;
  suppliers: any[];
  specifications: any[];
}

export default function ProductForm({
  initialData,
  onCancel,
}: ProductFormProps) {
  const [product, setProduct] = useState<Product>({
    product_id: initialData?.product_id || "",
    product_name: initialData?.product_name || "",
    product_sku: initialData?.product_sku || "",
    product_description: initialData?.product_description || "",
    product_price: initialData?.product_price || 0,
    product_quantity: initialData?.product_quantity || 0,
    product_discount: initialData?.product_discount || 0,
    product_status: initialData?.product_status || "draft",
    tags: initialData?.tags || [{ value: "" }],
    thumbnails: initialData?.thumbnails || [],
    main_image: initialData?.main_image || undefined,
    brand_name: initialData?.brand_name || "",
    brand_image: initialData?.brand_image || undefined,
    category_id: initialData?.category_id || "",
    suppliers: initialData?.suppliers || [],
    specifications: initialData?.specifications || [],
  });

  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.main_image && typeof initialData.main_image === "string"
      ? `data:image/jpeg;base64,${initialData.main_image}`
      : null
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProduct((prev) => ({ ...prev, main_image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Product Data on Submit:", product);

    setIsSubmitting(true);

    const formData = new FormData();

    Object.entries(product).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, JSON.stringify(item));
          });
        } else if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    console.log("FormData Entries:", Array.from(formData.entries()));

    let result;
    if (!product.product_id) {
      // Creating a new product
      result = await SubmitAction({ message: "" }, formData); // Replace with your create function
    } else {
      // Updating an existing product
      result = await updateProduct(product.product_id, formData); // Replace with your update function
    }

    setIsSubmitting(false);

    if (result) {
      toast({
        title: "Success",
        description: product.product_id
          ? "Product updated successfully"
          : "Product created successfully",
      });
      router.push("/dashboard/products"); // Adjust route as needed
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: "Failed to process product",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="hidden"
        name="product_id"
        value={product.product_id}
        onChange={(e) =>
          setProduct((prev) => ({
            ...prev,
            product_id: e.target.value || "",
          }))
        }
      />
      <div>
        <Label htmlFor="product_name">Product Name</Label>
        <Input
          id="product_name"
          name="product_name"
          value={product.product_name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="product_sku">Product SKU</Label>
        <Input
          id="product_sku"
          name="product_sku"
          value={product.product_sku}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="product_description">Product Description</Label>
        <Textarea
          id="product_description"
          name="product_description"
          value={product.product_description}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="product_price">Product Price</Label>
        <Input
          id="product_price"
          name="product_price"
          value={product.product_price}
          onChange={handleChange}
          type="number"
        />
      </div>
      <div>
        <Label htmlFor="product_quantity">Product Quantity</Label>
        <Input
          id="product_quantity"
          name="product_quantity"
          value={product.product_quantity}
          onChange={handleChange}
          type="number"
        />
      </div>
      <div>
        <Label htmlFor="product_discount">Product Discount</Label>
        <Input
          id="product_discount"
          name="product_discount"
          value={product.product_discount}
          onChange={handleChange}
          type="number"
        />
      </div>
      <div>
        <Label htmlFor="main_image">Main Image</Label>
        <Input
          id="main_image"
          name="main_image"
          type="file"
          onChange={handleFileChange}
          accept="image/*"
        />
        {imagePreview && (
          <Image
            height={100}
            width={100}
            src={imagePreview}
            alt="Preview"
            className="mt-2 h-20 w-20 object-cover"
          />
        )}
      </div>
      <div>
        <Label htmlFor="category_id">Category</Label>
        <Select
          onValueChange={(value) =>
            setProduct((prev) => ({ ...prev, category_id: value }))
          }
          defaultValue={product.category_id}>
          <SelectTrigger>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>{/* Populate categories here */}</SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="status">Product Status</Label>
        <Select
          onValueChange={(value) =>
            setProduct((prev) => ({
              ...prev,
              product_status: value as "draft" | "active" | "inactive",
            }))
          }
          defaultValue={product.product_status}>
          <SelectTrigger>
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
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
  );
}
