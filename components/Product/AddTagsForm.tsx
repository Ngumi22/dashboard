"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface AddTagsFormProps {
  onTagsChange: (tags: string[]) => void;
}

// Zod schema for tag validation
const tagSchema = z
  .string()
  .min(1, { message: "Tag cannot be empty" })
  .max(20, { message: "Tag cannot exceed 20 characters" });

export const AddTagsForm = ({ onTagsChange }: AddTagsFormProps) => {
  const [productTags, setProductTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const tag = currentTag.trim();

        // Validate the tag using the Zod schema
        const result = tagSchema.safeParse(tag);

        if (!result.success) {
          setErrorMessage(result.error.errors[0]?.message || "Invalid tag");
          return;
        }

        if (productTags.includes(tag)) {
          setErrorMessage("Tag already exists");
          return;
        }

        setErrorMessage(null); // Clear error if validation passes

        const newTags = [...productTags, tag];
        setProductTags(newTags);
        onTagsChange(newTags); // Let the parent know about the new tags
        setCurrentTag("");
      }
    },
    [currentTag, productTags, onTagsChange]
  );

  const removeTag = useCallback(
    (tagToRemove: string) => {
      const updatedTags = productTags.filter((tag) => tag !== tagToRemove);
      setProductTags(updatedTags);
      onTagsChange(updatedTags); // Let the parent know about the updated tags
    },
    [productTags, onTagsChange]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Tags</CardTitle>
        <CardContent>
          <FormItem>
            <FormLabel>Tags</FormLabel>
            <FormControl>
              <Input
                type="text"
                id="tags"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add a tag and press enter"
              />
            </FormControl>
            {errorMessage && (
              <div className="text-red-500 mt-1">{errorMessage}</div>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {productTags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center bg-secondary rounded px-2 py-1">
                  <span>{tag}</span>
                  <Button
                    variant="link"
                    className="ml-2 text-red-500"
                    onClick={() => removeTag(tag)}>
                    x
                  </Button>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        </CardContent>
      </CardHeader>
    </Card>
  );
};

export default AddTagsForm;
