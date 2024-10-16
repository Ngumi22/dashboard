"use client";

import { useEffect } from "react";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface Variant {
  variant_name: string;
  price: number;
  quantity: number;
  sku: string;
}

interface AddVariantsProps {
  onVariantsChange: (variants: Variant[]) => void;
  initialVariants?: Variant[];
}

export default function AddVariants({
  onVariantsChange,
  initialVariants = [],
}: AddVariantsProps) {
  const { control, watch, setValue, handleSubmit } = useForm({
    defaultValues: {
      variant_name: "",
      price: "",
      quantity: "",
      sku: "",
      variants: initialVariants,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const variant_name = watch("variant_name");
  const price = watch("price");
  const quantity = watch("quantity");
  const sku = watch("sku");
  const variants = watch("variants");

  useEffect(() => {
    onVariantsChange(variants);
  }, [variants, onVariantsChange]);

  const handleAddVariant = handleSubmit(() => {
    if (variant_name && price && quantity && sku) {
      const existingVariant = variants.find(
        (variant) =>
          variant.variant_name === variant_name && variant.sku === sku
      );

      if (existingVariant) {
        alert(`Variant "${variant_name}" with SKU "${sku}" already exists.`);
        return;
      }

      append({
        variant_name,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        sku,
      });

      // Clear fields after adding the variant
      setValue("variant_name", "");
      setValue("price", "");
      setValue("quantity", "");
      setValue("sku", "");
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Product Variants</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="variant_name">Variant Name</Label>
          <Controller
            name="variant_name"
            control={control}
            render={({ field }) => (
              <Input
                id="variant_name"
                placeholder="Enter variant name"
                {...field}
              />
            )}
          />
        </div>

        <div>
          <Label htmlFor="price">Price</Label>
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <Input
                id="price"
                type="number"
                placeholder="Enter price"
                {...field}
              />
            )}
          />
        </div>

        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Controller
            name="quantity"
            control={control}
            render={({ field }) => (
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                {...field}
              />
            )}
          />
        </div>

        <div>
          <Label htmlFor="sku">SKU</Label>
          <Controller
            name="sku"
            control={control}
            render={({ field }) => (
              <Input id="sku" placeholder="Enter SKU" {...field} />
            )}
          />
        </div>

        <Button type="button" onClick={handleAddVariant}>
          Add Variant
        </Button>

        <div className="mt-4">
          <h4 className="font-semibold">Added Variants:</h4>
          {fields.length > 0 ? (
            <ul className="space-y-2">
              {fields.map((variant, index) => (
                <li
                  key={variant.id}
                  className="flex items-center justify-between">
                  <span>
                    {variant.variant_name} - ${variant.price}, Qty:{" "}
                    {variant.quantity}, SKU: {variant.sku}
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No variants added yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
