"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { toast } from "../ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { useState } from "react";

const FormSchema = z.object({
  variantTypeId: z.string().min(1, { message: "Variant Type is required." }),
  value: z.string().min(1, { message: "Value is required." }),
  price: z.number().min(0, { message: "Price must be a positive number." }),
  quantity: z
    .number()
    .min(0, { message: "Quantity must be a non-negative number." }),
  attributes: z.array(
    z.object({
      attributeName: z
        .string()
        .min(1, { message: "Attribute Name is required." }),
      attributeValue: z.string().optional(),
    })
  ),
  images: z.array(z.string().url()).optional(),
  newVariantType: z.string().optional(),
});

export default function AddVariants({ productId }: { productId: number }) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      variantTypeId: "",
      value: "",
      price: 0,
      quantity: 0,
      attributes: [{ attributeName: "", attributeValue: "" }],
      images: [],
      newVariantType: "",
    },
  });

  const [variantTypes, setVariantTypes] = useState([
    { id: "1", name: "Color" },
    { id: "2", name: "RAM" },
    { id: "3", name: "Storage" },
    { id: "4", name: "Processor" },
  ]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (data.newVariantType) {
      // Add the new variant type to the list
      setVariantTypes((prev) => [
        ...prev,
        {
          id: String(prev.length + 1),
          name: data.newVariantType || "New Variant",
        },
      ]);

      // Reset the new variant type field in the form
      form.setValue("newVariantType", "");
    }

    toast({
      title: "Variant added successfully",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="variantTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Variant Type</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select variant type" {...field} />
                  </SelectTrigger>
                  <SelectContent>
                    {variantTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                    {/* Optionally, you could add a placeholder or default option */}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newVariantType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Variant Type (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter new variant type" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Input type="text" placeholder="e.g., Red, 16GB" {...field} />
              </FormControl>
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
                <Input
                  type="number"
                  placeholder="0.00"
                  value={field.value?.toString() ?? "0"}
                  onChange={(e) => field.onChange(Number(e.target.value))} // Convert to number
                  min={0}
                />
              </FormControl>
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
                <Input
                  type="number"
                  placeholder="0"
                  value={field.value?.toString() ?? "0"}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  min={0}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="attributes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attributes</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {field.value.map((attribute, index) => (
                    <div key={index} className="flex space-x-2">
                      <Controller
                        control={form.control}
                        name={`attributes.${index}.attributeName`}
                        render={({ field: nameField }) => (
                          <Input
                            placeholder="Attribute Name"
                            {...nameField} // This will ensure real-time updates
                          />
                        )}
                      />
                      <Controller
                        control={form.control}
                        name={`attributes.${index}.attributeValue`}
                        render={({ field: valueField }) => (
                          <Input
                            placeholder="Attribute Value"
                            {...valueField} // This will ensure real-time updates
                          />
                        )}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() =>
                      form.setValue("attributes", [
                        ...field.value,
                        { attributeName: "", attributeValue: "" },
                      ])
                    }>
                    Add Attribute
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Images</FormLabel>
          <FormControl>
            <Input
              name="images"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                const fileUrls = files.map((file) => URL.createObjectURL(file));
                form.setValue("images", fileUrls);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
