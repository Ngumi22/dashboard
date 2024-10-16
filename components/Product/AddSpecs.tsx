"use client";

import { useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const placeholderCategorySpecs: { [key: string]: string[] } = {
  laptops: ["RAM", "Processor", "Storage"],
  phones: ["Screen Size", "Battery", "Camera"],
  printers: ["Print Speed", "Paper Size"],
};

const categories = [
  { id: "laptops", name: "Laptops" },
  { id: "phones", name: "Phones" },
  { id: "printers", name: "Printers" },
];

interface Specification {
  name: string;
  value: string;
  category_id: string;
}

interface AddSpecificationsProps {
  onSpecificationsChange: (specifications: Specification[]) => void;
  initialSpecifications?: Specification[];
}

export default function AddSpecifications({
  onSpecificationsChange,
  initialSpecifications = [],
}: AddSpecificationsProps) {
  const { control, watch, setValue, handleSubmit } = useForm({
    defaultValues: {
      selectedCategory: "",
      selectedSpec: "",
      newSpecName: "",
      specValue: "",
      specifications: initialSpecifications,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "specifications",
  });

  const selectedCategory = watch("selectedCategory");
  const selectedSpec = watch("selectedSpec");
  const newSpecName = watch("newSpecName");
  const specValue = watch("specValue");
  const specifications = watch("specifications");

  useEffect(() => {
    if (selectedCategory) {
      setValue("selectedSpec", "");
      setValue("newSpecName", "");
      setValue("specValue", "");
    }
  }, [selectedCategory, setValue]);

  useEffect(() => {
    onSpecificationsChange(specifications);
  }, [specifications, onSpecificationsChange]);

  const handleAddSpec = handleSubmit(() => {
    const specName = selectedSpec || newSpecName;
    if ((selectedSpec || newSpecName) && specValue) {
      const existingSpec = specifications.find(
        (spec) =>
          spec.name === specName && spec.category_id === selectedCategory
      );

      if (existingSpec) {
        alert(`Specification "${specName}" already exists for this category.`);
        return;
      }

      append({
        name: specName,
        value: specValue,
        category_id: selectedCategory,
      });

      setValue("selectedSpec", "");
      setValue("newSpecName", "");
      setValue("specValue", "");
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Product Specifications</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="category">Select Category</Label>
          <Controller
            name="selectedCategory"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {selectedCategory && (
          <>
            <div>
              <Label htmlFor="existingSpec">Select an Existing Spec</Label>
              <Controller
                name="selectedSpec"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="existingSpec">
                      <SelectValue placeholder="Select a specification" />
                    </SelectTrigger>
                    <SelectContent>
                      {placeholderCategorySpecs[selectedCategory]?.map(
                        (spec, index) => (
                          <SelectItem key={index} value={spec}>
                            {spec}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="newSpec">Or Add a New Spec</Label>
              <Controller
                name="newSpecName"
                control={control}
                render={({ field }) => (
                  <Input
                    id="newSpec"
                    placeholder="New Specification Name"
                    {...field}
                  />
                )}
              />
            </div>

            <div>
              <Label htmlFor="specValue">Specification Value</Label>
              <Controller
                name="specValue"
                control={control}
                render={({ field }) => (
                  <Input id="specValue" placeholder="Enter value" {...field} />
                )}
              />
            </div>

            <Button type="button" onClick={handleAddSpec}>
              Add Specification
            </Button>
          </>
        )}

        <div className="mt-4">
          <h4 className="font-semibold">Added Specifications:</h4>
          {fields.length > 0 ? (
            <ul className="space-y-2">
              {fields.map((spec, index) => (
                <li key={spec.id} className="flex items-center justify-between">
                  <span>
                    {spec.name}: {spec.value}
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No specifications added yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
