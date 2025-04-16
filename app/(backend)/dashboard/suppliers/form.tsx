"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { updateSupplierAction } from "@/lib/actions/Supplier/update";
import { addSupplier } from "@/lib/actions/Supplier/post";
import { supplierSchema } from "@/lib/ZodSchemas/supplierSchema";
import type { Supplier } from "@/lib/actions/Supplier/supplierTypes";

interface SupplierFormProps {
  initialData?: Supplier;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function SupplierForm({
  initialData,
  onClose,
  onSuccess,
}: SupplierFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<Supplier>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      supplier_name: initialData?.supplier_name || "",
      supplier_email: initialData?.supplier_email || "",
      supplier_phone_number: initialData?.supplier_phone_number || "",
      supplier_location: initialData?.supplier_location || "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;
  const onSubmit = async (data: Supplier) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (data.supplier_name) {
        formData.append("supplier_name", data.supplier_name);
      }
      if (data.supplier_email) {
        formData.append("supplier_email", data.supplier_email);
      }

      // Only append these fields if they have values
      if (data.supplier_phone_number) {
        formData.append("supplier_phone_number", data.supplier_phone_number);
      }
      if (data.supplier_location) {
        formData.append("supplier_location", data.supplier_location);
      }

      const result = initialData?.supplier_id
        ? await updateSupplierAction(
            initialData.supplier_id.toString(),
            formData
          )
        : await addSupplier(formData);

      if (result.success) {
        toast({
          title: "Success",
          description: initialData
            ? "Supplier updated successfully"
            : "Supplier created successfully",
        });
        onSuccess?.();
        onClose?.();
        if (!initialData) {
          router.refresh();
        }
      } else {
        throw new Error(result.message || "Failed to process supplier");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? "Edit Supplier" : "Create New Supplier"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supplier_name">Supplier Name*</Label>
            <Input
              id="supplier_name"
              {...register("supplier_name")}
              placeholder="Enter supplier name"
            />
            {errors.supplier_name && (
              <p className="text-red-500 text-sm">
                {errors.supplier_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier_email">Email*</Label>
            <Input
              id="supplier_email"
              type="email"
              {...register("supplier_email")}
              placeholder="supplier@example.com"
            />
            {errors.supplier_email && (
              <p className="text-red-500 text-sm">
                {errors.supplier_email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier_phone_number">Phone Number</Label>
            <Input
              id="supplier_phone_number"
              {...register("supplier_phone_number")}
              placeholder="123-456-7890"
            />
            {errors.supplier_phone_number && (
              <p className="text-red-500 text-sm">
                {errors.supplier_phone_number.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier_location">Location</Label>
            <Input
              id="supplier_location"
              {...register("supplier_location")}
              placeholder="City, Country"
            />
            {errors.supplier_location && (
              <p className="text-red-500 text-sm">
                {errors.supplier_location.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            {onClose && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Processing..."
                : initialData
                  ? "Update Supplier"
                  : "Create Supplier"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
