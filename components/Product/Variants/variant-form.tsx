"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Plus, Pencil } from "lucide-react";
import { variantFormSchema, type VariantFormValues } from "./schema";

import { getSpecificationsForProduct } from "@/lib/actions/Specifications/fetch";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { toast } from "@/components/ui/use-toast";
import { ImagePreview } from "./image-preview";
import { getVariant, upsertVariant } from "@/lib/actions/Variants/actions";

interface VariantFormProps {
  variantId?: number;
  productId: string;
}

export function VariantForm({ variantId, productId }: VariantFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [specifications, setSpecifications] = useState<
    { specification_id: number; specification_name: string }[]
  >([]);

  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: {
      variantId: variantId,
      productId: Number.parseInt(productId),
      specificationId: 0,
      value: "",
      variantPrice: 0,
      variantQuantity: 0,
      variantStatus: "active",
    },
  });

  useEffect(() => {
    const fetchSpecifications = async () => {
      const specs = await getSpecificationsForProduct(productId);
      if (specs) {
        setSpecifications(specs); // Directly set the array of specifications
      }
    };

    fetchSpecifications();
  }, [productId]);

  useEffect(() => {
    if (variantId && open) {
      getVariant(variantId).then((data) => {
        if (data) {
          form.reset(data);
        }
      });
    }
  }, [variantId, open, form]);

  async function onSubmit(data: VariantFormValues) {
    setIsLoading(true);
    try {
      const result = await upsertVariant(data);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: variantId
            ? "Variant updated successfully"
            : "Variant created successfully",
        });
        setOpen(false);
        form.reset();
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>
          {variantId ? (
            <Pencil className="mr-2 h-4 w-4" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          {variantId ? "Edit Variant" : "Add Variant"}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-50 overflow-y-scroll">
        <DrawerHeader>
          <DrawerTitle>
            {variantId ? "Edit Variant" : "Add New Variant"}
          </DrawerTitle>
          <DrawerDescription>
            {variantId
              ? "Update the details of an existing variant."
              : "Fill in the details to create a new product variant."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="specificationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specification</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(Number.parseInt(value))
                      }
                      defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a specification" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectContent>
                          {specifications.map((spec) => (
                            <SelectItem
                              key={spec.specification_id}
                              value={spec.specification_id.toString()}>
                              {spec.specification_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the specification for this variant.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the value of the variant (e.g. red, 16gb).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="variantPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number.parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the price of the variant.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="variantQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number.parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the quantity of the variant in stock.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="variantStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select variant status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the status of the variant.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Images</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          field.onChange(files);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload images for the variant (optional).
                    </FormDescription>
                    <FormMessage />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {field.value?.map((file, index) => (
                        <ImagePreview key={index} file={file} />
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DrawerFooter>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {variantId ? "Update Variant" : "Create Variant"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
