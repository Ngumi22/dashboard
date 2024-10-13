"use client";

import { useState } from "react";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

const thumbnailSchema = z
  .array(z.instanceof(File))
  .length(5, { message: "Exactly 5 thumbnails are required" })
  .refine((files) => files.every((file) => file.size <= 5 * 1024 * 1024), {
    message: "Each file must be 5MB or less.",
  })
  .refine(
    (files) =>
      files.every((file) =>
        ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(
          file.type
        )
      ),
    {
      message: "Files must be JPEG, PNG, WEBP, or JPG.",
    }
  );

const formSchema = z.object({
  thumbnails: thumbnailSchema,
});

type FormValues = z.infer<typeof formSchema>;

export default function ThumbnailUploader() {
  const [previews, setPreviews] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      thumbnails: [],
    },
  });

  const { field: thumbnailsField } = useController({
    name: "thumbnails",
    control: form.control,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      form.setError("thumbnails", { message: "Maximum 5 files allowed" });
      return;
    }
    thumbnailsField.onChange(files);

    // Generate previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeFile = (index: number) => {
    const newFiles = [...thumbnailsField.value];
    newFiles.splice(index, 1);
    thumbnailsField.onChange(newFiles);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const onSubmit = (data: FormValues) => {
    console.log("Form submitted:", data);
    // Here you would typically send the data to your server
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
