"use client";

import { useEffect, useState } from "react";
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
import { Plus, Trash2 } from "lucide-react";

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
  const [existingSuppliers, setExistingSuppliers] = useState<Supplier[]>([]);

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

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/supplier");
        const data = await response.json();
        if (data.suppliers && data.suppliers.supplier) {
          setExistingSuppliers(data.suppliers.supplier);
        }
      } catch (error) {
        console.error("Failed to fetch suppliers:", error);
      }
    };

    fetchSuppliers();
  }, []);

  const handleAddSupplier = handleSubmit(() => {
    if (selectedSupplier) {
      const existingSupplier = existingSuppliers.find(
        (s) => s.supplier_id?.toString() === selectedSupplier
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
    <div className="border p-2 space-y-2 shadow rounded">
      <h2>Add Product Suppliers</h2>

      <div className="space-y-4">
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
                    key={supplier.supplier_id ?? "no-id"}
                    value={
                      supplier.supplier_id
                        ? supplier.supplier_id.toString()
                        : ""
                    }>
                    {supplier.supplier_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        <div className="space-y-2">
          <h2>Add New</h2>
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

        <Button
          type="button"
          variant="secondary"
          onClick={handleAddSupplier}
          className="">
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>

        <div className="mt-4">
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
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove Supplier</span>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No suppliers added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
