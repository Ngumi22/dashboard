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
    id: 1,
    name: "Supplier A",
    email: "supplierA@example.com",
    phone_number: "123-456-7890",
    location: "City A",
  },
  {
    id: 2,
    name: "Supplier B",
    email: "supplierB@example.com",
    phone_number: "098-765-4321",
    location: "City B",
  },
];

interface Supplier {
  id?: number;
  name?: string;
  email?: string;
  phone_number?: string;
  location?: string;
}

interface AddSuppliersProps {
  onSuppliersChange: (suppliers: Supplier[]) => void;
  initialSuppliers?: Supplier[];
}

export default function AddSuppliers({
  onSuppliersChange,
  initialSuppliers = [],
}: AddSuppliersProps) {
  const { control, watch, setValue, handleSubmit } = useForm({
    defaultValues: {
      selectedSupplier: "",
      newSupplier: {
        name: "",
        email: "",
        phone_number: "",
        location: "",
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
        (s) => s.id.toString() === selectedSupplier
      );
      if (existingSupplier) {
        append({
          id: existingSupplier.id,
          name: existingSupplier.name,
          email: existingSupplier.email || "",
          phone_number: existingSupplier.phone_number || "",
          location: existingSupplier.location || "",
        });
      }
    } else {
      append(newSupplier);
    }

    setValue("selectedSupplier", "");
    setValue("newSupplier", {
      name: "",
      email: "",
      phone_number: "",
      location: "",
    });
  });

  return (
    <Card>
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
                      key={supplier.id}
                      value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div>
          <Label htmlFor="newSupplierName">Or Add a New Supplier</Label>
          <Controller
            name="newSupplier.name"
            control={control}
            render={({ field }) => (
              <Input
                id="newSupplierName"
                placeholder="Supplier Name"
                {...field}
              />
            )}
          />
        </div>

        <div>
          <Label htmlFor="newSupplierEmail">Email</Label>
          <Controller
            name="newSupplier.email"
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
        </div>

        <div>
          <Label htmlFor="newSupplierPhone">Phone Number</Label>
          <Controller
            name="newSupplier.phone_number"
            control={control}
            render={({ field }) => (
              <Input
                id="newSupplierPhone"
                placeholder="123-456-7890"
                {...field}
              />
            )}
          />
        </div>

        <div>
          <Label htmlFor="newSupplierLocation">Location</Label>
          <Controller
            name="newSupplier.location"
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

        <Button type="button" onClick={handleAddSupplier}>
          Add Supplier
        </Button>

        <div className="mt-4">
          <h4 className="font-semibold">Added Suppliers:</h4>
          {fields.length > 0 ? (
            <ul className="space-y-2">
              {fields.map((supplier, index) => (
                <li
                  key={supplier.id}
                  className="flex items-center justify-between">
                  <span>
                    {supplier.name} {supplier.id ? "(Existing)" : "(New)"}
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
            <p>No suppliers added yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
