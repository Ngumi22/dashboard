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

// Mock existing suppliers data (This should be fetched from your API in a real application)
const existingSuppliers = [
  {
    supplier_id: 1,
    supplier_name: "Supplier A",
    supplier_email: "supplierA@example.com",
    supplier_phone_number: "123-456-7890",
    supplier_location: "City A",
  },
  {
    supplier_id: 2,
    supplier_name: "Supplier BB",
    supplier_email: "supplierB@example.com",
    supplier_phone_number: "098-765-4321",
    supplier_location: "City B",
  },
];

interface Supplier {
  supplier_id?: number;
  supplier_name?: string;
  supplier_email?: string;
  supplier_phone_number?: string;
  supplier_location?: string;
  isNew?: boolean;
}

interface AddSuppliersProps {
  onSuppliersChange: (suppliers: Supplier[]) => void;
  initialSuppliers?: Supplier[];
}

export default function Component({
  onSuppliersChange,
  initialSuppliers = [],
}: AddSuppliersProps) {
  const { control, watch, setValue, handleSubmit } = useForm({
    defaultValues: {
      selectedSupplier: "",
      newSupplier: {
        supplier_name: "",
        supplier_email: "",
        supplier_phone_number: "",
        supplier_location: "",
      },
      suppliers: initialSuppliers,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "suppliers",
  });

  const selectedSupplier = watch("selectedSupplier");
  const newSupplier = watch("newSupplier");
  const suppliers = watch("suppliers");

  useEffect(() => {
    onSuppliersChange(suppliers);
  }, [suppliers, onSuppliersChange]);

  const handleAddSupplier = handleSubmit(() => {
    if (selectedSupplier) {
      const existingSupplier = existingSuppliers.find(
        (s) => s.supplier_id.toString() === selectedSupplier
      );
      if (existingSupplier) {
        append({
          supplier_id: existingSupplier.supplier_id,
          supplier_name: existingSupplier.supplier_name,
          supplier_email: existingSupplier.supplier_email,
          supplier_phone_number: existingSupplier.supplier_phone_number,
          supplier_location: existingSupplier.supplier_location,
          isNew: false,
        });
      }
    } else if (newSupplier.supplier_name) {
      append({
        ...newSupplier,
        isNew: true,
      });
    }

    setValue("selectedSupplier", "");
    setValue("newSupplier", {
      supplier_name: "",
      supplier_email: "",
      supplier_phone_number: "",
      supplier_location: "",
    });
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add Product Suppliers</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="supplier">Select Existing Supplier</Label>
          <Controller
            name="selectedSupplier"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {existingSuppliers.map((supplier) => (
                    <SelectItem
                      key={supplier.supplier_id}
                      value={supplier.supplier_id.toString()}>
                      {supplier.supplier_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newSupplierName">Or Add a New Supplier</Label>
          <Controller
            name="newSupplier.supplier_name"
            control={control}
            render={({ field }) => (
              <Input
                id="newSupplierName"
                placeholder="Supplier Name"
                {...field}
              />
            )}
          />

          <Controller
            name="newSupplier.supplier_email"
            control={control}
            render={({ field }) => (
              <Input
                id="newSupplierEmail"
                type="email"
                placeholder="supplier@example.com"
                {...field}
              />
            )}
          />

          <Controller
            name="newSupplier.supplier_phone_number"
            control={control}
            render={({ field }) => (
              <Input
                id="newSupplierPhone"
                placeholder="123-456-7890"
                {...field}
              />
            )}
          />

          <Controller
            name="newSupplier.supplier_location"
            control={control}
            render={({ field }) => (
              <Input
                id="newSupplierLocation"
                placeholder="City, Country"
                {...field}
              />
            )}
          />
        </div>

        <Button type="button" onClick={handleAddSupplier} className="w-full">
          Add Supplier
        </Button>

        <div className="mt-4">
          <h4 className="font-semibold mb-2">Added Suppliers:</h4>
          {fields.length > 0 ? (
            <ul className="space-y-2">
              {fields.map((supplier, index) => (
                <li
                  key={supplier.id}
                  className="flex items-center justify-between p-2 bg-secondary rounded-md">
                  <span>
                    {supplier.supplier_name} (
                    {supplier.isNew ? "New" : "Existing"})
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
            <p className="text-muted-foreground">No suppliers added yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
