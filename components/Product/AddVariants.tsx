"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
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
  variants: z.array(
    z.object({
      variantTypeId: z
        .string()
        .min(1, { message: "Variant Type is required." }),
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
      images: z.array(z.instanceof(File)).optional().nullable(), // This field is nullable if images are not required
    })
  ),
  newVariantType: z.string().optional(),
});

export default function AddVariants({ productId }: { productId: number }) {
  const [submittedVariants, setSubmittedVariants] = useState<any>();
  const [variantTypes, setVariantTypes] = useState([
    { id: "1", name: "Color", requiresImages: true },
    { id: "2", name: "RAM", requiresImages: false },
    { id: "3", name: "Storage", requiresImages: false },
    { id: "4", name: "Processor", requiresImages: false },
  ]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      variants: [
        {
          variantTypeId: "",
          value: "",
          price: 0,
          quantity: 0,
          attributes: [{ attributeName: "", attributeValue: "" }],
          images: null,
        },
      ],
      newVariantType: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (data.newVariantType) {
      // Add the new variant type to the list
      setVariantTypes((prev) => [
        ...prev,
        {
          id: String(prev.length + 1),
          name: data.newVariantType || "New Variant",
          requiresImages: false,
        },
      ]);
      // Reset the new variant type field
      form.setValue("newVariantType", "");
    }

    setSubmittedVariants(data);

    // Simulate submission logic (e.g., save to database)
    toast({
      title: "Variants added successfully",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <section>
      <h3 className="text-lg font-bold">Add Product Variants</h3>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-2/3 space-y-6">
          {fields.map((item, index) => {
            const currentVariantType = variantTypes.find(
              (type) =>
                type.id === form.getValues(`variants.${index}.variantTypeId`)
            );

            return (
              <div key={item.id} className="border p-4 rounded-md space-y-4">
                {/* Variant Type Selection */}
                <FormField
                  control={form.control}
                  name={`variants.${index}.variantTypeId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Variant Type</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue(`variants.${index}.images`, null); // Reset images if variant type changes
                          }}
                          defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select variant type" />
                          </SelectTrigger>
                          <SelectContent>
                            {variantTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Variant Value */}
                <FormField
                  control={form.control}
                  name={`variants.${index}.value`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="e.g., Red, 16GB"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price */}
                <FormField
                  control={form.control}
                  name={`variants.${index}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={field.value?.toString() ?? "0"}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Quantity */}
                <FormField
                  control={form.control}
                  name={`variants.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          value={field.value?.toString() ?? "0"}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Attributes */}
                <FormField
                  control={form.control}
                  name={`variants.${index}.attributes`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attributes</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {field.value.map((attribute, attrIndex) => (
                            <div key={attrIndex} className="flex space-x-2">
                              <Controller
                                control={form.control}
                                name={`variants.${index}.attributes.${attrIndex}.attributeName`}
                                render={({ field: nameField }) => (
                                  <Input
                                    placeholder="Attribute Name"
                                    {...nameField}
                                  />
                                )}
                              />
                              <Controller
                                control={form.control}
                                name={`variants.${index}.attributes.${attrIndex}.attributeValue`}
                                render={({ field: valueField }) => (
                                  <Input
                                    placeholder="Attribute Value"
                                    {...valueField}
                                  />
                                )}
                              />
                            </div>
                          ))}
                          <Button
                            type="button"
                            onClick={() =>
                              form.setValue(`variants.${index}.attributes`, [
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

                {/* Images */}
                {currentVariantType?.requiresImages && (
                  <FormField
                    control={form.control}
                    name={`variants.${index}.images`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Upload Images</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            multiple
                            onChange={(e) =>
                              field.onChange(
                                e.target.files
                                  ? Array.from(e.target.files)
                                  : null
                              )
                            }
                            accept="image/png, image/jpeg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button type="button" onClick={() => remove(index)}>
                  Remove Variant
                </Button>
              </div>
            );
          })}

          {/* Button to Add Another Variant */}
          <Button
            type="button"
            onClick={() =>
              append({
                variantTypeId: "",
                value: "",
                price: 0,
                quantity: 0,
                attributes: [{ attributeName: "", attributeValue: "" }],
                images: null,
              })
            }>
            Add Another Variant
          </Button>

          {/* Add New Variant Type */}
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

          <Button type="submit">Submit Variants</Button>
        </form>
      </Form>

      <div>
        {submittedVariants && (
          <div className="mt-4">
            <h3 className="text-lg font-bold">Submitted Variants:</h3>
            <pre className=" p-4 rounded">
              <code>{JSON.stringify(submittedVariants, null, 2)}</code>
            </pre>
          </div>
        )}
      </div>
    </section>
  );
}
