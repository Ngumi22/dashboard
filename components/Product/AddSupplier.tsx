"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { supplierSchema } from "@/lib/formSchema";

interface AddSupplierFormProps {
  onSupplierChange: (supplier: any) => void; // Callback to handle supplier data
}

export default function AddSupplierForm({
  onSupplierChange,
}: AddSupplierFormProps) {
  const form = useForm<z.infer<typeof supplierSchema>>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      supplier: null,
      newSupplier: {
        name: "",
        contact_info: { phone: "", address: "" },
        email: "",
      },
    },
  });

  // Placeholder data for suppliers
  const [suppliers, setSuppliers] = useState<any[]>([
    { supplier_id: 1, name: "Supplier A" },
    { supplier_id: 2, name: "Supplier B" },
    { supplier_id: 3, name: "Supplier C" },
  ]);

  const [isNewSupplier, setIsNewSupplier] = useState(false);

  // Handle supplier selection change
  const handleSupplierChange = (value: string) => {
    form.setValue("supplier", value); // Update form state

    if (value === "new") {
      setIsNewSupplier(true);
      // Reset newSupplier fields when adding a new supplier
      form.setValue("newSupplier", {
        name: "",
        contact_info: { phone: "", address: "" },
        email: "",
      });
    } else {
      setIsNewSupplier(false);
      const selectedSupplier = suppliers.find(
        (supplier) => supplier.supplier_id.toString() === value
      );
      onSupplierChange(selectedSupplier); // Notify parent about the selected supplier
    }
  };

  // Handle new supplier submission
  const handleNewSupplierChange = (newSupplier: any) => {
    onSupplierChange(newSupplier); // Notify parent about the new supplier
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Supplier Selection */}
        <FormField
          control={form.control}
          name="supplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Existing Supplier</FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(value) => handleSupplierChange(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem
                        key={supplier.supplier_id}
                        value={supplier.supplier_id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="new">Add New Supplier</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conditionally Render New Supplier Fields */}
        {isNewSupplier && (
          <>
            <FormField
              control={form.control}
              name="newSupplier.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Add New Supplier (if applicable)</FormLabel>
                  <FormControl>
                    <Input placeholder="New Supplier Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newSupplier.contact_info.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newSupplier.contact_info.address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Address (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newSupplier.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
