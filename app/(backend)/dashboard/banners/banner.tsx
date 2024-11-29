"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBanner } from "@/lib/actions/Banners/post";
import { getUniqueBanners } from "@/lib/actions/Banners/fetch";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface Banner {
  banner_id?: number;
  title: string;
  description?: string;
  link?: string;
  image?: File;
  text_color: string;
  background_color: string;
  usage_context: string;
  status: "active" | "inactive";
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().max(500).optional(),
  link: z.string().url().optional(),
  image: z
    .any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .png, and .webp formats are supported."
    )
    .optional(),
  text_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
  background_color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
  status: z.enum(["active", "inactive"]),
  usage_context: z.string().optional(),
});

export default function BannerForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);

  const form = useForm<Banner>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: "",
      description: "",
      link: "",
      text_color: "#000000",
      background_color: "#FFFFFF",
      status: "active",
      usage_context: "",
    },
  });

  useEffect(() => {
    async function fetchBanners() {
      let res = await getUniqueBanners();
      setBanners(res);
    }
    fetchBanners();
  }, []);

  async function onSubmit(data: Banner) {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    const result = await createBanner(formData);
    setIsSubmitting(false);
    if (result.success) {
      form.reset();
      // Show success message
    } else {
      // Show error message
    }
  }

  return (
    <div>
      <div className="justify-end">
        <Dialog>
          <DialogTrigger className="border border-black p-2 rounded">
            Add Banner
          </DialogTrigger>
          <DialogContent className="h-fit">
            <Card>
              <CardHeader>
                <CardTitle>Create Banner</CardTitle>
              </CardHeader>

              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-2">
                    <div className="grid md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="usage_context"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Usage</FormLabel>
                            <FormControl>
                              <Input placeholder="Where to use it" {...field} />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="inactive">
                                    Inactive
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Link</FormLabel>
                          <FormControl>
                            <Input {...field} type="url" />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={(e) =>
                                field.onChange(e.target.files?.[0])
                              }
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="text_color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Text Color</FormLabel>
                            <FormControl>
                              <Input {...field} type="color" />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="background_color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Background Color</FormLabel>
                            <FormControl>
                              <Input {...field} type="color" />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Banner"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      </div>
      <div>
        <ul className="grid grid-cols-2 gap-2">
          {banners?.map((banner) => (
            <li key={banner.banner_id}>
              <div className="mx-auto py-9 md:py-12 px-4 md:px-2">
                <div className="flex items-stretch justify-center flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 lg:space-x-6">
                  <div
                    style={{
                      backgroundColor: banner.background_color, // Default fallback color
                    }}
                    className="flex flex-col md:flex-row items-stretch justify-between py-4 px-5 md:py-12 lg:px-8 md:w-8/12 lg:w-7/12 xl:w-8/12 2xl:w-9/12">
                    <div className="flex flex-col justify-center space-y-2 md:w-1/2">
                      <h1
                        className="text-3xl lg:text-4xl font-semibold"
                        style={{
                          textDecorationColor: banner.text_color, // Default fallback color
                        }}>
                        {banner.title}
                      </h1>
                      <p
                        className="text-base lg:text-xl text-gray-800 dark:text-white mt-2"
                        style={{
                          textDecorationColor: banner.text_color, // Default fallback color
                        }}>
                        {banner.description}
                      </p>
                      <Link href={String(banner.link)}>
                        <Button>Buy Now</Button>
                      </Link>
                    </div>
                    <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center md:justify-end hover:scale-125">
                      <Image
                        loading="lazy"
                        className="h-auto w-auto object-cover"
                        src={`data:image/jpeg;base64,${banner.image}`}
                        alt={banner.title}
                        height={100}
                        width={100}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
