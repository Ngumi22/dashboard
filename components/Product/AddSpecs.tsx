"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm, Controller } from "react-hook-form";
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

interface Specification {
  specification_name: string;
  specification_value: string;
  category_id: string;
}

interface AddSpecificationsProps {
  onSpecificationsChange: (specifications: Specification[]) => void;
  initialSpecifications?: Specification[];
  selectedCategoryId: string; // category ID will be passed as a prop
}

export default function AddSpecifications({
  onSpecificationsChange,
  initialSpecifications = [],
  selectedCategoryId,
}: AddSpecificationsProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [categorySpecs, setCategorySpecs] = useState<string[]>([]);
  const [loadingSpecs, setLoadingSpecs] = useState<boolean>(false);

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

  useEffect(() => {
    if (selectedCategoryId) {
      const fetchCategorySpecs = async () => {
        try {
          setLoadingSpecs(true);
          const response = await fetch(
            `/api/category/catSpec?categoryId=${selectedCategoryId}`
          );
          const data = await response.json();

          const categorySpecifications = data.specs.catSpecs.map(
            (spec: { specification_name: string }) => spec.specification_name
          );
          setCategorySpecs(categorySpecifications);
        } catch (error) {
          console.error("Error fetching category specifications:", error);
        } finally {
          setLoadingSpecs(false);
        }
      };

      fetchCategorySpecs();
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    if (selectedSpec) {
      setMessage(`Specification "${selectedSpec}" selected`);
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [selectedSpec]);

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
        category_id: selectedCategoryId, // use the passed category ID directly
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
      <h2>Add Specifications</h2>
      <div className="space-y-6">
        {loadingSpecs ? (
          <p>Loading specifications...</p>
        ) : (
          <>
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
                  <Input id="specValue" placeholder="Enter value" {...field} />
                )}
              />
              {errors.specValue && (
                <p className="text-sm text-destructive mt-1">
                  {errors.specValue.message}
                </p>
              )}
            </div>

            <Button variant="secondary" type="button" onClick={handleAddSpec}>
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
