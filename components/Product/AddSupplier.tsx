"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";

const schema = z.object({
  supplier: z.string().nullable(), // Accepts either an existing supplier or null
  newSupplier: z
    .object({
      name: z.string().min(1, "Supplier name is required").optional(),
      contact_info: z
        .object({
          phone: z.string().optional(),
          address: z.string().optional(),
        })
        .optional(),
      email: z.string().email("Invalid email format").optional(),
    })
    .optional(),
});

interface AddSupplierFormProps {
  onSupplierChange: (supplier: any) => void; // Callback to handle supplier data
}

export default function AddSupplierForm({
  onSupplierChange,
}: AddSupplierFormProps) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      supplier: null,
      newSupplier: {
        name: "",
        contact_info: { phone: "", address: "" },
        email: "",
      },
    },
  });

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isNewSupplier, setIsNewSupplier] = useState(false);

  useEffect(() => {
    async function fetchSuppliers() {
      // Fetch existing suppliers from the API or database
      const response = await fetch("/api/suppliers"); // Adjust the API endpoint as needed
      const data = await response.json();
      setSuppliers(data);
    }

    fetchSuppliers();
  }, []);

  useEffect(() => {
    // Call onSupplierChange whenever the form data changes
    const subscription = form.watch((data) => {
      if (data.supplier) {
        // If an existing supplier is selected
        const selectedSupplier = suppliers.find(
          (supplier) => supplier.supplier_id.toString() === data.supplier
        );
        onSupplierChange(selectedSupplier);
      } else if (data.newSupplier) {
        // If a new supplier is added
        onSupplierChange(data.newSupplier);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, suppliers, onSupplierChange]);

  return (
    <Card>
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
                  onValueChange={field.onChange}>
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
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Add New Supplier */}
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
      </CardContent>
    </Card>
  );
}
