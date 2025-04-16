"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Check, AlertCircle, Minus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getCategorySpecs } from "@/lib/actions/Category/fetch";

interface Specification {
  specification_name: string;
  specification_value: string;
  category_id: string;
}

interface AddSpecificationsProps {
  onSpecificationsChange: (specifications: Specification[]) => void;
  initialSpecifications?: Specification[];
  selectedCategoryId: string;
}

export default function AddSpecifications({
  onSpecificationsChange,
  initialSpecifications = [],
  selectedCategoryId,
}: AddSpecificationsProps) {
  const [message, setMessage] = useState<string | null>(null);

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
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

  const selectedSpec = watch("selectedSpec");
  const newSpecName = watch("newSpecName");
  const specValue = watch("specValue");
  const specifications = watch("specifications");

  // Using React Query to fetch category specifications
  const {
    data: categorySpecs = [],
    isLoading: loadingSpecs,
    error: specsError,
  } = useQuery({
    queryKey: ["categorySpecs", selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return [];
      const data = await getCategorySpecs([Number(selectedCategoryId)]);
      return Array.from(data?.get(Number(selectedCategoryId)) || []);
    },
    select: (data) => {
      // Filter to only include subcategories (those with parent_category_id)
      return data
        .filter((spec: any) => spec.parent_category_id !== null)
        .map((spec: { specification_name: string }) => spec.specification_name);
    },
    enabled: !!selectedCategoryId,
  });

  useEffect(() => {
    if (specsError) {
      setMessage("Error loading specifications");
    } else if (
      categorySpecs.length === 0 &&
      !loadingSpecs &&
      selectedCategoryId
    ) {
      setMessage("No specifications found. You can add new ones.");
    }
  }, [categorySpecs, loadingSpecs, specsError, selectedCategoryId]);

  // Notify parent component of specification changes
  useEffect(() => {
    onSpecificationsChange(specifications);
  }, [specifications, onSpecificationsChange]);

  const handleAddSpec = handleSubmit(() => {
    const specName = selectedSpec || newSpecName;

    if (specName && specValue) {
      const existingSpec = specifications.find(
        (spec) =>
          spec.specification_name === specName &&
          spec.category_id === selectedCategoryId
      );

      if (existingSpec) {
        setMessage(
          `Specification "${specName}" already exists for this category.`
        );
        const timer = setTimeout(() => setMessage(null), 3000);
        return () => clearTimeout(timer);
      }

      append({
        specification_name: specName,
        specification_value: specValue,
        category_id: selectedCategoryId,
      });

      setValue("selectedSpec", "");
      setValue("newSpecName", "");
      setValue("specValue", "");
      setMessage(`Specification "${specName}" added successfully.`);
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  });

  return (
    <div className="border p-2 shadow rounded">
      <h2 className="text-xl font-semibold">Product Specifications</h2>
      <div className="space-y-6 mt-3">
        {loadingSpecs ? (
          <p>Loading specifications...</p>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="existingSpec">Select a Specification</Label>
              <Controller
                name="selectedSpec"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="existingSpec">
                      <SelectValue placeholder="Select a specification" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorySpecs.map((spec, index) => (
                        <SelectItem key={index} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newSpec">Add New Specification</Label>
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
                  <Input id="specValue" placeholder="Enter value" {...field} />
                )}
              />
              {errors.specValue && (
                <p className="text-sm text-destructive mt-1">
                  {errors.specValue.message}
                </p>
              )}
            </div>

            <Button
              variant="default"
              className=""
              type="button"
              onClick={handleAddSpec}>
              <Plus className="mr-2 h-4 w-4" /> Add Specification
            </Button>
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
            fields.map((spec, index) => (
              <div
                key={spec.id}
                className="flex justify-between items-center mb-2">
                <span>
                  {spec.specification_name}: {spec.specification_value}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => remove(index)}>
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <p>No specifications added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
