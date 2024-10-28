"use client";

import { useEffect, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Laptop,
  Smartphone,
  Printer,
  X,
  AlertCircle,
  Check,
  Trash2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const placeholderCategorySpecs: { [key: string]: string[] } = {
  laptops: ["RAM", "Processor", "Storage"],
  phones: ["Screen Size", "Battery", "Camera"],
  printers: ["Print Speed", "Paper Size"],
};

const categories = [
  { id: "laptops", name: "Laptops", icon: Laptop },
  { id: "phones", name: "Phones", icon: Smartphone },
  { id: "printers", name: "Printers", icon: Printer },
];

interface Specification {
  specification_name: string;
  specification_value: string;
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
  const [message, setMessage] = useState("");

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
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

  useEffect(() => {
    if (selectedSpec) {
      setMessage(`Specification "${selectedSpec}" selected`);
      setTimeout(() => setMessage(""), 3000);
    }
  }, [selectedSpec]);

  const handleAddSpec = handleSubmit(() => {
    const specName = selectedSpec || newSpecName;
    if ((selectedSpec || newSpecName) && specValue) {
      const existingSpec = specifications.find(
        (spec) =>
          spec.specification_name === specName &&
          spec.category_id === selectedCategory
      );

      if (existingSpec) {
        setMessage(
          `Specification "${specName}" already exists for this category.`
        );
        setTimeout(() => setMessage(""), 3000);
        return;
      }

      append({
        specification_name: specName,
        specification_value: specValue,
        category_id: selectedCategory,
      });

      setValue("selectedSpec", "");
      setValue("newSpecName", "");
      setValue("specValue", "");
      setMessage(`Specification "${specName}" added successfully.`);
      setTimeout(() => setMessage(""), 3000);
    }
  });

  return (
    <div className="border p-2 shadow rounded">
      <h2>Add Specifications</h2>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="category">Select a Category</Label>
          <Controller
            name="selectedCategory"
            control={control}
            rules={{ required: "Category is required" }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center">
                        {category.icon && (
                          <category.icon className="mr-2 h-4 w-4" />
                        )}
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.selectedCategory && (
            <p className="text-sm text-destructive mt-1">
              {errors.selectedCategory.message}
            </p>
          )}
        </div>

        {selectedCategory && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-2">
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

              <div className="space-y-2">
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

              <div className="space-y-2">
                <Label htmlFor="specValue">Specification Value</Label>
                <Controller
                  name="specValue"
                  control={control}
                  rules={{ required: "Specification value is required" }}
                  render={({ field }) => (
                    <Input
                      id="specValue"
                      placeholder="Enter value"
                      {...field}
                    />
                  )}
                />
                {errors.specValue && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.specValue.message}
                  </p>
                )}
              </div>

              <Button
                variant="outline"
                type="button"
                onClick={handleAddSpec}
                className="h-9 rounded-md px-3 border bg-gray-300 mx-auto">
                <Plus className="mr-2 h-4 w-4" /> Add Specification
              </Button>
            </div>
          </>
        )}

        {message && (
          <Alert
            variant={
              message.includes("successfully") ? "default" : "destructive"
            }>
            {message.includes("successfully") ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {message.includes("successfully") ? "Success" : "Notice"}
            </AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="mt-6">
          <h4 className="font-semibold mb-4">Added Specifications:</h4>
          {fields.length > 0 ? (
            <ul className="space-y-3">
              {fields.map((spec, index) => (
                <li
                  key={spec.id}
                  className="flex items-center justify-between p-3 bg-secondary rounded-md">
                  <div>
                    <Badge variant="outline" className="mb-1">
                      {categories.find((c) => c.id === spec.category_id)?.name}
                    </Badge>
                    <p className="font-medium">
                      {spec.specification_name}: {spec.specification_value}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove Spec</span>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No specifications added</AlertTitle>
              <AlertDescription>
                Add specifications using the form above to see them listed here.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
