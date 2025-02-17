"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { variantFormSchema, type VariantFormValues } from "./schema";
import { getSpecificationsForProduct } from "@/lib/actions/Specifications/fetch";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { ImagePreview } from "./image-preview";
import { updateVariant } from "@/lib/actions/Variants/update";
import { createVariant } from "@/lib/actions/Variants/actions";
import { Card, CardContent } from "@/components/ui/card";

interface VariantFormProps {
  variantId?: number;
  productId: string;
}

export function VariantForm({ variantId, productId }: VariantFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [specifications, setSpecifications] = useState<
    { specification_id: number; specification_name: string }[]
  >([]);
  const [selectedSpec, setSelectedSpec] = useState<number | null>(null);
  const [specValue, setSpecValue] = useState("");

  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: {
      variantId: variantId,
      productId: Number(productId),
      variantPrice: 0,
      variantQuantity: 0,
      variantStatus: "active",
      specifications: [],
      images: [],
    },
  });

  useEffect(() => {
    if (!productId) {
      console.error("No productId provided.");
      return;
    }

    const fetchSpecifications = async () => {
      const specs = await getSpecificationsForProduct(productId);
      setSpecifications(specs);
    };

    fetchSpecifications();
  }, [productId]);

  useEffect(() => {
    if (variantId) {
      const fetchVariant = async () => {
        const response = await fetch(`/api/variants/${variantId}`);
        if (response.ok) {
          const data = await response.json();
          form.reset(data);
        }
      };
      fetchVariant();
    }
  }, [variantId, form]);

  const addSpecification = () => {
    if (selectedSpec && specValue) {
      const currentSpecifications = form.getValues("specifications");
      form.setValue("specifications", [
        ...currentSpecifications,
        { specificationId: selectedSpec, value: specValue },
      ]);
      setSelectedSpec(null);
      setSpecValue("");
    }
  };

  const removeSpecification = (index: number) => {
    const currentSpecifications = form.getValues("specifications");
    form.setValue(
      "specifications",
      currentSpecifications.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (data: VariantFormValues) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      if (data.productId !== undefined) {
        formData.append("productId", data.productId.toString());
      }
      formData.append("variantPrice", data.variantPrice.toString());
      formData.append("variantQuantity", data.variantQuantity.toString());
      formData.append("variantStatus", data.variantStatus);

      // Append specifications as JSON
      if (data.specifications.length > 0) {
        formData.append("specifications", JSON.stringify(data.specifications));
      }

      // Append images properly
      if (data.images && data.images.length > 0) {
        data.images.forEach((file, index) => {
          if (index === 0) {
            // First image is the full image
            formData.append("images[]", file);
            formData.append("image_type", "full");
          } else {
            // All other images are thumbnails
            formData.append("images[]", file);
            formData.append("image_type", "thumbnail");
          }
        });
      }

      if (variantId) {
        await updateVariant(variantId, formData);
      } else {
        await createVariant(formData);
      }

      router.push(`/dashboard/products/${productId}/variants`);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to submit the form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 overflow-y-scroll">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Specifications Field */}
          <FormField
            control={form.control}
            name="specifications"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specifications</FormLabel>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex space-x-2 mb-4">
                      <Select
                        value={selectedSpec?.toString() || ""}
                        onValueChange={(value) =>
                          setSelectedSpec(Number(value))
                        }>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select a specification" />
                        </SelectTrigger>
                        <SelectContent>
                          {specifications.map((spec) => (
                            <SelectItem
                              key={spec.specification_id}
                              value={spec.specification_id.toString()}>
                              {spec.specification_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Value"
                        value={specValue}
                        onChange={(e) => setSpecValue(e.target.value)}
                        className="flex-grow"
                      />
                      <Button
                        type="button"
                        onClick={addSpecification}
                        disabled={!selectedSpec || !specValue}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {field.value.map((spec, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-muted p-2 rounded-md">
                          <span>
                            {
                              specifications.find(
                                (s) =>
                                  s.specification_id === spec.specificationId
                              )?.specification_name
                            }
                            : {spec.value}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSpecification(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <FormDescription>
                  Add specifications for this variant.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Price Input */}
          <FormField
            control={form.control}
            name="variantPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number.parseFloat(e.target.value))
                    }
                  />
                </FormControl>
                <FormDescription>
                  Enter the price of the variant.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Quantity Input */}
          <FormField
            control={form.control}
            name="variantQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number.parseInt(e.target.value))
                    }
                  />
                </FormControl>
                <FormDescription>
                  Enter the quantity of the variant in stock.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status Select */}
          <FormField
            control={form.control}
            name="variantStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select variant status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose the status of the variant.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image Upload */}
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      // Assuming first image is full, the rest are thumbnails
                      const [fullImage, ...thumbnailImages] = files;
                      const updatedImages = [fullImage, ...thumbnailImages]; // Keep the first as full, the rest as thumbnails
                      field.onChange(updatedImages);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Upload images for the variant (optional).
                </FormDescription>
                <FormMessage />
                <div className="mt-2 flex flex-wrap gap-2">
                  {field.value?.map((file, index) => (
                    <ImagePreview key={index} file={file} />
                  ))}
                </div>
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {variantId ? "Update Variant" : "Create Variant"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
