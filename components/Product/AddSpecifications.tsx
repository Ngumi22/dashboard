"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// Mock placeholder specifications for each category (This should be dynamic and fetched from a database)
const placeholderCategorySpecs: { [key: string]: string[] } = {
  laptops: ["RAM", "Processor", "Storage"],
  phones: ["Screen Size", "Battery", "Camera"],
  printers: ["Print Speed", "Paper Size"],
};

// Mock category data (This should be dynamic and fetched from a database)
const categories = [
  { id: "laptops", name: "Laptops" },
  { id: "phones", name: "Phones" },
  { id: "printers", name: "Printers" },
];

interface AddSpecificationsProps {
  onSpecificationsChange: (
    specifications: { name: string; value: string }[]
  ) => void;
}

const AddSpecifications = ({
  onSpecificationsChange,
}: AddSpecificationsProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(""); // Track selected category
  const [existingSpecs, setExistingSpecs] = useState<string[]>([]); // Specifications of the selected category
  const [selectedSpec, setSelectedSpec] = useState<string>(""); // Track selected specification
  const [newSpecName, setNewSpecName] = useState<string>(""); // New spec name
  const [specValue, setSpecValue] = useState<string>(""); // Specification value
  const [specs, setSpecs] = useState<{ name: string; value: string }[]>([]); // Added specifications

  // Update specifications when category changes
  useEffect(() => {
    if (selectedCategory) {
      const categorySpecs = placeholderCategorySpecs[selectedCategory] || [];
      setExistingSpecs(categorySpecs); // Set specs for the selected category
    }
  }, [selectedCategory]);

  // Handle adding a new or existing specification
  const handleAddSpec = () => {
    if ((selectedSpec || newSpecName) && specValue) {
      const spec = {
        name: selectedSpec || newSpecName, // Use selected spec or new spec name
        value: specValue,
      };
      const updatedSpecs = [...specs, spec];
      setSpecs(updatedSpecs); // Update local state
      onSpecificationsChange(updatedSpecs); // Send updated specs back to the parent form

      // Reset fields
      setSelectedSpec("");
      setNewSpecName("");
      setSpecValue("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Product Specifications</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Step 1: Select a category */}
        <div>
          <label>Select Category</label>
          <Select
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value)} // Update selected category
          >
            <SelectTrigger>
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
        </div>

        {/* Step 2: Display and select existing specifications if category is selected */}
        {selectedCategory && (
          <>
            {/* Select an existing specification */}
            <div>
              <label>Select an Existing Spec</label>
              <Select
                value={selectedSpec}
                onValueChange={(value) => setSelectedSpec(value)} // Update selected specification
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a specification" />
                </SelectTrigger>
                <SelectContent>
                  {existingSpecs.map((spec, index) => (
                    <SelectItem key={index} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Or add a new specification */}
            <div>
              <label>Or Add a New Spec</label>
              <Input
                placeholder="New Specification Name"
                value={newSpecName}
                onChange={(e) => setNewSpecName(e.target.value)} // Handle new spec input
              />
            </div>

            {/* Input the spec value */}
            <div>
              <label>Specification Value</label>
              <Input
                placeholder="Enter value"
                value={specValue}
                onChange={(e) => setSpecValue(e.target.value)} // Handle spec value input
              />
            </div>

            {/* Add specification button */}
            <Button onClick={handleAddSpec}>Add Specification</Button>
          </>
        )}

        {/* Display added specifications */}
        <div className="mt-4">
          <h4 className="font-semibold">Added Specifications:</h4>
          {specs.length > 0 ? (
            <ul>
              {specs.map((spec, index) => (
                <li key={index}>
                  {spec.name}: {spec.value}
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
};

export default AddSpecifications;
