// AddTagsForm.tsx
"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";

interface AddTagsFormProps {
  onTagsChange: (tags: string[]) => void;
}

export const AddTagsForm = ({ onTagsChange }: AddTagsFormProps) => {
  const [productTags, setProductTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState<string>("");

  const form = useFormContext();

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && currentTag.trim() !== "") {
        e.preventDefault();
        const newTags = [...productTags, currentTag.trim()];
        setProductTags(newTags);
        form.setValue("tags", newTags);
        onTagsChange(newTags);
        setCurrentTag("");
      }
    },
    [currentTag, productTags, form, onTagsChange]
  );

  const removeTag = useCallback(
    (tagToRemove: string) => {
      const updatedTags = productTags.filter((tag) => tag !== tagToRemove);
      setProductTags(updatedTags);
      form.setValue("tags", updatedTags);
      onTagsChange(updatedTags);
    },
    [productTags, form, onTagsChange]
  );

  return (
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
      <div className="flex flex-wrap gap-2 mt-2">
        {productTags.map((tag, index) => (
          <div
            key={index}
            className="flex items-center bg-gray-200 rounded px-2 py-1">
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
  );
};

export default AddTagsForm;
