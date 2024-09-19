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
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// Validation schema for form data
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
  value: string;
}

interface Category {
  id: string;
  name: string;
}

interface AddSpecificationFormProps {
  specificationsData: any; // Pre-existing specifications passed from parent form
  onSpecificationsChange: (data: { [name: string]: string }) => void; // Expecting an object with specifications.
}

export default function AddSpecificationForm({
  specificationsData,
  onSpecificationsChange,
}: AddSpecificationFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [specifications, setSpecifications] = useState<Specification[]>([]);

  const [newSpecificationName, setNewSpecificationName] = useState<string>("");
  const [newSpecificationValue, setNewSpecificationValue] =
    useState<string>("");

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      categoryId: "",
      specifications: [], // Start with an empty array
    },
  });

  // Fetching categories initially
  useEffect(() => {
    async function fetchCategories() {
      // Simulating fetching categories
      return [
        { id: "1", name: "Laptops" },
        { id: "2", name: "Phones" },
      ];
    }
    fetchCategories().then(setCategories);
  }, []);

  // Fetching specifications based on selected category
  async function fetchSpecifications(categoryId: string) {
    // Simulating fetching specifications
    return [
      { id: "1", name: "RAM", value: "" },
      { id: "2", name: "Storage", value: "" },
    ];
  }

  // API call to add a new specification
  const addNewSpecificationToAPI = async (specification: Specification) => {
    // Simulate an API call with a timeout
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Mock API call with specification:", specification);
        resolve({ success: true });
      }, 500); // Simulate a 500ms API delay
    });
  };

  // Adding a new specification and updating the state
  const handleAddNewSpecification = async () => {
    const newSpec: Specification = {
      id: Date.now().toString(), // Generate a unique ID
      name: newSpecificationName,
      value: newSpecificationValue,
    };

    try {
      await addNewSpecificationToAPI(newSpec);
      setSpecifications((prevSpecs) => [...prevSpecs, newSpec]);
      setNewSpecificationName(""); // Clear the input field
      setNewSpecificationValue(""); // Clear the input field
    } catch (error) {
      console.error("Failed to add specification:", error);
    }
  };

  // Handling category change and fetching associated specifications
  function handleCategoryChange(categoryId: string) {
    form.setValue("categoryId", categoryId);
    fetchSpecifications(categoryId).then(setSpecifications);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Specs</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
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

        {/* Specifications Section */}
        <FormField
          control={form.control}
          name="specifications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specifications</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {(field.value || []).map((spec, index) => (
                    <div key={index} className="flex space-x-2">
                      <Controller
                        control={form.control}
                        name={`specifications.${index}.specificationId`}
                        render={({ field: specField }) => (
                          <Select
                            value={specField.value}
                            onValueChange={(value) => {
                              specField.onChange(value);
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
                          <Input placeholder="Value" {...valueField} />
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

        {/* Add New Specification Section */}
        <div className="space-y-2">
          <FormLabel>Add New Specification</FormLabel>
          <Input
            placeholder="New Specification Name"
            value={newSpecificationName}
            onChange={(e) => setNewSpecificationName(e.target.value)}
          />
          <Input
            placeholder="Value"
            value={newSpecificationValue}
            onChange={(e) => setNewSpecificationValue(e.target.value)}
          />
          <Button type="button" onClick={handleAddNewSpecification}>
            Add New Specification
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
