import React, { useState } from "react";
import { useFieldArray, Control, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface ArrayInputProps {
  name: string;
  control: Control<any>;
  register: UseFormRegister<any>;
  label: string;
  placeholder?: string;
  errors?: Record<string, any>;
}

export function ArrayInput({
  name,
  control,
  register,
  label,
  placeholder,
  errors,
}: ArrayInputProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        append(inputValue.trim());
        setInputValue("");
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center space-x-2">
            <Input
              {...register(`${name}.${index}`)}
              defaultValue={field.id}
              readOnly
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || `Add ${label.toLowerCase()}`}
        />
      </div>
      {errors && errors[name] && (
        <p className="text-sm text-red-500">{errors[name].message}</p>
      )}
    </div>
  );
}
