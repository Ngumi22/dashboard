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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const schema = z.object({
  categoryId: z.string().min(1, "Category is required."),
  specifications: z
    .array(
      z.object({
        specificationId: z.string().min(1, "Specification is required."),
        value: z.string().min(1, "Value is required."),
      })
    )
    .optional(),
});

interface Specification {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface AddSpecificationFormProps {
  onSpecificationsChange: (data: z.infer<typeof schema>) => void;
}

export default function AddSpecificationForm({
  onSpecificationsChange,
}: AddSpecificationFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      categoryId: "",
      specifications: [],
    },
  });

  useEffect(() => {
    // Fetch categories and set them to state
    async function fetchCategories() {
      // Replace with your API call
      return [
        { id: "1", name: "Laptops" },
        { id: "2", name: "Phones" },
      ];
    }
    fetchCategories().then(setCategories);
  }, []);

  async function fetchSpecifications(categoryId: string) {
    // Replace with your API call
    return [
      { id: "1", name: "RAM" },
      { id: "2", name: "Storage" },
    ];
  }

  function handleCategoryChange(categoryId: string) {
    form.setValue("categoryId", categoryId);
    fetchSpecifications(categoryId).then(setSpecifications);
  }

  function handleSpecificationChange() {
    // Notify parent of specification changes
    onSpecificationsChange(form.getValues());
  }

  return (
    <Form {...form}>
      <form className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select
                  defaultValue={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleCategoryChange(value);
                  }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specifications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specifications</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {(field.value || []).map((spec, index) => (
                    <div key={index} className="">
                      <Controller
                        control={form.control}
                        name={`specifications.${index}.specificationId`}
                        render={({ field: specField }) => (
                          <Select
                            defaultValue={specField.value}
                            onValueChange={(value) => {
                              specField.onChange(value);
                              handleSpecificationChange();
                            }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select specification" />
                            </SelectTrigger>
                            <SelectContent>
                              {specifications.map((specification) => (
                                <SelectItem
                                  key={specification.id}
                                  value={specification.id}>
                                  {specification.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <Controller
                        control={form.control}
                        name={`specifications.${index}.value`}
                        render={({ field: valueField }) => (
                          <Input
                            placeholder="Value"
                            {...valueField}
                            onBlur={() => handleSpecificationChange()} // Notify parent on value change
                          />
                        )}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const updatedSpecs =
                            field.value?.filter((_, i) => i !== index) || [];
                          form.setValue("specifications", updatedSpecs);
                        }}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() =>
                      form.setValue("specifications", [
                        ...(field.value || []),
                        { specificationId: "", value: "" },
                      ])
                    }>
                    Add Specification
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
