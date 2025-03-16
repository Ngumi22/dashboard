"use server";

import { z } from "zod";
import { fileToBuffer } from "@/lib/utils";

export async function createProductImages(
  formData: FormData,
  productId: number,
  connection?: any
) {
  const imageData = {
    mainImage: formData.get("main_image"),
    thumbnails: formData.getAll("thumbnails"),
  };

  const validatedProductId = z.number().positive().parse(productId);

  const mainImageBuffer = await fileToBuffer(imageData.mainImage as File);
  const thumbnailBuffers = await Promise.all(
    (imageData.thumbnails as File[]).map((thumbnail) => fileToBuffer(thumbnail))
  );

  await connection.query(
    `INSERT INTO product_images (product_id, main_image, thumbnail_image1, thumbnail_image2, thumbnail_image3, thumbnail_image4, thumbnail_image5)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [validatedProductId, mainImageBuffer, ...thumbnailBuffers]
  );

  return {
    success: true,
    message: "Images uploaded successfully",
  };
}
