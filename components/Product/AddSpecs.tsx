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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Check, AlertCircle, Minus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Category {
  id: string;
  name: string;
}

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
  const [categorySpecs, setCategorySpecs] = useState<string[]>([]); // To hold real data for specifications
  const [categories, setCategories] = useState<Category[]>([]); // Fetch real categories
  const [categoryNames, setCategoryNames] = useState<string[]>([]); // Store only category names

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

  // Fetch categories from the database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/category`);
        const data = await response.json();

        // Assuming categories is an array and we only need the names
        const categoryNames = data.categories.map(
          (category: { category_name: string }) => category.category_name
        );

        console.log(categoryNames);
        setCategories(data.categories); // Store the full category data (with IDs)
        setCategoryNames(categoryNames); // Store just the category names
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch category-specific specifications from the database
  useEffect(() => {
    if (selectedCategory) {
      const fetchCategorySpecs = async () => {
        try {
          // Fetch specifications based on the selected category name
          const response = await fetch(
            `/api/category/catSpec?categoryName=${selectedCategory}`
          );
          const data = await response.json();

          // Correctly extract catSpecs from the response
          const categorySpecifications = data.specs.catSpecs.map(
            (spec: { specification_name: string }) => spec.specification_name
          );

          setCategorySpecs(categorySpecifications); // Set category specs to the state
        } catch (error) {
          console.error("Error fetching category specifications:", error);
        }
      };

      fetchCategorySpecs();
    }
  }, [selectedCategory]);

  // Clear fields when the category changes
  useEffect(() => {
    if (selectedCategory) {
      setValue("selectedSpec", "");
      setValue("newSpecName", "");
      setValue("specValue", "");
    }
  }, [selectedCategory, setValue]);

  // Send updated specifications to parent
  useEffect(() => {
    onSpecificationsChange(specifications);
  }, [specifications, onSpecificationsChange]);

  // Show message on spec selection
  useEffect(() => {
    if (selectedSpec) {
      setMessage(`Specification "${selectedSpec}" selected`);
      setTimeout(() => setMessage(""), 3000);
    }
  }, [selectedSpec]);

  // Handle spec addition
  const handleAddSpec = handleSubmit(() => {
    const specName = selectedSpec || newSpecName;
    if (specName && specValue) {
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
                <SelectContent className="text-red-600 text-lg">
                  {categoryNames.map((categoryName) => (
                    <SelectItem
                      key={categoryName}
                      value={categoryName}
                      className="text-red-600 text-lg">
                      {categoryName}
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

              <Button variant="secondary" type="button" onClick={handleAddSpec}>
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
                  className="flex items-center justify-between p-2 border rounded">
                  <span>
                    {spec.specification_name}: {spec.specification_value}
                  </span>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(index)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No specifications added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
