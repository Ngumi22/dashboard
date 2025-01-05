"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createEntity,
  updateEntity,
} from "@/lib/actions/Auth/entities/actions";

export interface Entity {
  id: number;
  entity_name: string;
}

interface EntityFormProps {
  entity?: Entity;
}

export function EntityForm({ entity }: EntityFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Omit<Entity, "id">>({
    entity_name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (entity) {
      setFormData({ entity_name: entity.entity_name });
    }
  }, [entity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append("entity_name", formData.entity_name);

    try {
      if (entity) {
        formDataToSend.append("id", entity.id.toString());
        const result = await updateEntity(formDataToSend);
        if (result.success) {
          console.log("Entity updated successfully");
          router.push("/dashboard/roles"); // Redirect to entities list
        } else {
          console.error("Error updating entity:", result.error);
        }
      } else {
        const result = await createEntity(formDataToSend);
        if (result.success) {
          console.log("Entity created successfully");
          router.push("/dashboard/roles"); // Redirect to entities list
        } else {
          console.error("Error creating entity:", result.error);
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="entity_name">Entity Name</Label>
        <Input
          id="entity_name"
          name="entity_name"
          value={formData.entity_name}
          onChange={handleChange}
          required
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? "Submitting..."
          : entity
          ? "Update Entity"
          : "Create Entity"}
      </Button>
    </form>
  );
}
