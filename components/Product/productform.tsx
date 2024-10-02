"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import { X } from "lucide-react";
import { useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
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
import { z } from "zod";
import { ProductSubmit } from "@/lib/product_submit";
import { schema } from "@/lib/formSchema";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dynamic from "next/dynamic";
import AddSupplierForm from "./AddSupplier";
import { Supplier } from "@/lib/types";

const AddTagsForm = dynamic(() => import("./AddTagsForm"), { ssr: false });

export const ProductAdding = () => {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction] = useFormState(ProductSubmit, {
    message: "",
  });

  const form = useForm<z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      price: 0,
      quantity: 0,
      discount: 0,
      status: "draft",
      tags: [],
      supplier: { supplier: null },
    },
  });

  // Handle tag changes, updating the form field for 'tags'
  const handleTagsChange = useCallback(
    (tags: string[]) => {
      form.setValue("tags", tags); // Update the 'tags' field in the form state
    },
    [form]
  );

  const handleSupplierChange = useCallback(
    (supplier: Supplier | null) => {
      console.log("Selected Supplier:", supplier);

      const supplierData = supplier
        ? {
            supplier: {
              supplier_id: supplier.supplier_id,
              name: supplier.name,
              contact_info: {
                phone: supplier.contact_info?.phone || "", // Default to an empty string if not available
                address: supplier.contact_info?.address || "", // Default to an empty string if not available
                email: supplier.contact_info?.email || "", // Default to an empty string if not available
              },
            },
          }
        : { supplier: null }; // This should match the expected structure

      form.setValue("supplier", supplierData); // Set structured supplier object
    },
    [form]
  );

  const handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();

    form.handleSubmit((data) => {
      const formData = new FormData(formRef.current!);

      // Directly append form values to formData
      const tags = form.getValues("tags");
      const supplier = form.getValues("supplier");

      formData.append("tags", JSON.stringify(tags)); // Serialize tags
      formData.append("supplier", JSON.stringify(supplier)); // Serialize supplier

      // Check if supplier contains contact info before logging
      if (supplier && supplier.supplier) {
        console.log("Supplier Contact Info:", supplier.supplier.contact_info);
      }

      console.log("Form Data before submission:", Object.fromEntries(formData));

      // Submit form data
      ProductSubmit({ message: "" }, formData).then((response) => {
        console.log("Server Response:", response); // Handle the server response if needed
      });
    })(evt);
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        className="space-y-8"
        action={formAction}
        onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormDescription>Product name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="Enter SKU" {...field} />
                </FormControl>
                <FormDescription>SKU.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Description</FormLabel>
              <FormControl>
                <Input placeholder="Enter product description" {...field} />
              </FormControl>
              <FormDescription>Product description.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormDescription>Price</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormDescription>Quantity</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="discount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormDescription>Discount</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Card className="">
          <CardHeader>
            <CardTitle>Product Status</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Status</FormLabel>
                  <Select
                    {...field}
                    value={field.value} // Controlled value
                    onValueChange={(value) => field.onChange(value)} // Update form state on change
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <AddTagsForm onTagsChange={handleTagsChange} />

        <AddSupplierForm onSupplierChange={handleSupplierChange} />

        <Button type="submit">Submit</Button>
      </form>
      {state?.message !== "" && !state.issues && (
        <div className="text-red-500">{state.message}</div>
      )}
      {state?.issues && (
        <div className="text-red-500">
          <ul>
            {state.issues.map((issue) => (
              <li key={issue} className="flex gap-1">
                <X fill="red" />
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Form>
  );
};
