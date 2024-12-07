"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

const carouselSchema = z.object({
  carousel_id: z.number().optional(),
  title: z.string().min(1, "Title is required"),
  short_description: z.string().max(500).optional(),
  description: z.string().max(500).optional(),
  button_text: z.string().max(100).optional(),
  button_link: z.string().url().optional(),
  image: z.instanceof(Blob).optional(),
  status: z.enum(["active", "inactive"]),
});

export async function saveCarousel(prevState: any, formData: FormData) {
  const validatedFields = carouselSchema.safeParse({
    carousel_id: formData.get("carousel_id")
      ? Number(formData.get("carousel_id"))
      : undefined,
    title: formData.get("title"),
    short_description: formData.get("short_description"),
    description: formData.get("description"),
    button_text: formData.get("button_text"),
    button_link: formData.get("button_link"),
    image: formData.get("image"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const data = validatedFields.data;

  try {
    // Here you would typically save the data to your database
    // For demonstration, we'll just log it
    console.log("Saving carousel:", data);

    // In a real application, you'd use your database connection here
    // await db.carousels.upsert({ where: { carousel_id: data.carousel_id }, data })

    revalidatePath("/carousels");
    return { success: true, message: "Carousel saved successfully" };
  } catch (error) {
    return { error: "Failed to save carousel" };
  }
}
