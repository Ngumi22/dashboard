"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAction, updateAction } from "@/lib/actions/Auth/actions/actions";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

export interface Action {
  action_id: number;
  action_name: string;
}

interface ActionFormProps {
  action?: Action;
}

export function ActionForm({ action }: ActionFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Omit<Action, "action_id">>({
    action_name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (action) {
      setFormData({ action_name: action.action_name });
    }
  }, [action]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append("action_name", formData.action_name);

    try {
      if (action) {
        formDataToSend.append("action_id", action.action_id.toString());
        const result = await updateAction(formDataToSend);
        if (result.success) {
          toast({
            variant: "default",
            title: "Success",
            description: `Update action ${action.action_name} successful`,
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
          router.push("/dashboard/roles"); // Redirect to actions list
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.error || "Error updating action",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        }
      } else {
        const result = await createAction(formDataToSend);
        if (result.success) {
          toast({
            variant: "default",
            title: "Success",
            description: `Action created successfully`,
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
          router.push("/dashboard/roles"); // Redirect to actions list
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.error || "Error creating action",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
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
        <Label htmlFor="action_name">Action Name</Label>
        <Input
          id="action_name"
          name="action_name"
          value={formData.action_name}
          onChange={handleChange}
          required
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? "Submitting..."
          : action
          ? "Update Action"
          : "Create Action"}
      </Button>
    </form>
  );
}
