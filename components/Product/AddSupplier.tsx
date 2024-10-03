"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
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
import { Supplier } from "@/lib/types";

interface AddSupplierFormProps {
  onSupplierChange: (supplier: Supplier | null) => void;
}

export default function AddSupplierForm({
  onSupplierChange,
}: AddSupplierFormProps) {
  const [isNewSupplier, setIsNewSupplier] = useState(false);

  const form = useForm<z.infer<typeof supplierSchema>>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      supplier: null,
      newSupplier: null,
    },
  });

  // Simulate the suppliers data
  const [suppliers] = useState<Supplier[]>([
    {
      supplier_id: 1,
      name: "Supplier A",
      contact_info: {
        phone: "123-456-7890",
        address: "123 Supplier St",
        email: "supplierA@example.com",
      },
    },
    {
      supplier_id: 2,
      name: "Supplier B",
      contact_info: {
        phone: "234-567-8901",
        address: "234 Supplier Ave",
        email: "supplierB@example.com",
      },
    },
    {
      supplier_id: 3,
      name: "Supplier C",
      contact_info: {
        phone: "345-678-9012",
        address: "345 Supplier Blvd",
        email: "supplierC@example.com",
      },
    },
  ]);

  const handleSupplierChange = (value: string) => {
    if (value === "new") {
      setIsNewSupplier(true);
      form.resetField("supplier"); // Clear the supplier field
      onSupplierChange(null); // Notify that no existing supplier is selected
    } else {
      const selectedSupplierId = parseInt(value, 10);
      const selectedSupplier = suppliers.find(
        (supplier) => supplier.supplier_id === selectedSupplierId
      );

      if (selectedSupplier) {
        form.setValue("supplier", selectedSupplier);
        setIsNewSupplier(false); // Hide new supplier form
        onSupplierChange(selectedSupplier); // Pass selected supplier
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="supplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Existing Supplier</FormLabel>
              <FormControl>
                <Select
                  value={
                    field.value?.supplier_id
                      ? field.value.supplier_id.toString()
                      : ""
                  }
                  onValueChange={handleSupplierChange}>
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

        {isNewSupplier && (
          <>
            <FormField
              control={form.control}
              name="newSupplier.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Supplier Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Supplier Name" {...field} />
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
                    <Input placeholder="Enter Phone" {...field} />
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
                    <Input placeholder="Enter Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newSupplier.contact_info.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Email" {...field} />
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
