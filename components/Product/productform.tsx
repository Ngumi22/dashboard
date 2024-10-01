"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import { X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
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
import { combinedSchema } from "@/lib/formSchema";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddSupplierForm from "./AddSupplier";

export const ProductAdding = () => {
  const [state, formAction] = useFormState(ProductSubmit, {
    message: "",
  });

  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  const form = useForm<z.output<typeof combinedSchema>>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      status: "draft",
      price: 0, // default price
      quantity: 0, // default quantity
      discount: 0,
      supplier: {
        supplier: null, // Correct structure for existing supplier
        newSupplier: {
          name: "", // Ensure this structure is properly initialized
          contact_info: {
            phone: "",
            address: "",
          },
          email: "",
        },
      },
      ...(state?.fields ?? {}),
    },
  });

  const handleSupplierChange = (
    supplier: {
      supplier_id: { toString: () => string | null };
    } | null
  ) => {
    setSelectedSupplier(supplier);

    // Update the form state directly
    form.setValue(
      "supplier.supplier",
      supplier?.supplier_id?.toString() ?? null
    );

    // Reset newSupplier fields when an existing supplier is selected
    if (supplier) {
      // If a supplier is selected, clear the newSupplier fields
      form.setValue("supplier.newSupplier", {
        name: "",
        contact_info: {
          phone: undefined,
          address: undefined,
        },
        email: undefined,
      });
    } else {
      // If no supplier is selected, you may want to reset newSupplier as well
      form.setValue("supplier.newSupplier", {
        name: "",
        contact_info: {
          phone: undefined,
          address: undefined,
        },
        email: undefined,
      });
    }
  };

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Form {...form}>
      <form
        ref={formRef}
        className="space-y-8"
        action={formAction}
        onSubmit={(evt) => {
          evt.preventDefault();
          form.handleSubmit(() => {
            const formData = new FormData(formRef.current!);
            formAction(formData); // Submit form data including supplier info
          })(evt);
        }}>
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
