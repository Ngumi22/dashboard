"use server";

import { z } from "zod";
import { NextResponse } from "next/server";
import { fileToBuffer } from "@/lib/utils";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";

export async function createProductImages(
  formData: FormData,
  productId: number
) {
  const imageData = {
    mainImage: formData.get("main_image"),
    thumbnails: formData.getAll("thumbnails"),
  };

  const validatedProductId = z.number().positive().parse(productId);

  return dbOperation(async (connection) => {
    const mainImageBuffer = await fileToBuffer(imageData.mainImage as File);

    const thumbnailBuffers = await Promise.all(
      (imageData.thumbnails as File[]).map((thumbnail) =>
        fileToBuffer(thumbnail)
      )
    );

    const [result] = await connection.query(
      `INSERT INTO product_images (product_id, main_image, thumbnail_image1, thumbnail_image2, thumbnail_image3, thumbnail_image4, thumbnail_image5)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [validatedProductId, mainImageBuffer, ...thumbnailBuffers]
    );
    return NextResponse.json({
      success: true,
      message: "Images uploaded successfully",
      imageId: result.insertId,
    });
  });
}
