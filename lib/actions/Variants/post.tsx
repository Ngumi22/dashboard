// "use server";

// import { getConnection } from "@/lib/database";
// import { dbsetupTables } from "@/lib/MysqlTables";
// import { validateImage } from "@/lib/utils";
// import { variantSchema } from "@/lib/ZodSchemas/VaraintSchema";
// import { NextResponse } from "next/server";
// import { z } from "zod";

// // Custom error class for better error handling
// class CustomError extends Error {
//   statusCode: number;
//   constructor(message: string, statusCode: number) {
//     super(message);
//     this.statusCode = statusCode;
//   }
// }

// // Helper function for database operations
// export async function dbOperation<T>(
//   operation: (connection: any) => Promise<T>
// ): Promise<T> {
//   const connection = await getConnection();
//   try {
//     await connection.beginTransaction();
//     await dbsetupTables();
//     const result = await operation(connection);
//     await connection.commit();
//     return result;
//   } catch (error) {
//     await connection.rollback();
//     throw error;
//   } finally {
//     connection.release();
//   }
// }

// // Helper function to convert File to Buffer
// export async function fileToBuffer(file: File): Promise<Buffer> {
//   const arrayBuffer = await file.arrayBuffer();
//   return Buffer.from(arrayBuffer);
// }

// function parseNumberField(formData: FormData, key: string): number | undefined {
//   const value = formData.get(key);
//   if (typeof value === "string") {
//     const parsedValue = Number(value);
//     if (isNaN(parsedValue)) {
//       throw new Error(`Invalid ${key} data: not a number.`);
//     }
//     return parsedValue;
//   }
//   return undefined;
// }

// //Create or update variant with images
// export async function createVariantWithImages(formData: FormData) {
//   return dbOperation(async (connection) => {
//     const validatedData = variantSchema.parse(Object.fromEntries(formData));

//     // Validate images
//     const imageValidationResult = validateImage(validatedData.variant_image);
//     if (!imageValidationResult.valid) {
//       throw new Error(imageValidationResult.message);
//     }

//     for (const thumbnail of validatedData.variant_thumbnail1) {
//       const thumbnailValidationResult = validateImage(thumbnail);
//       if (!thumbnailValidationResult.valid) {
//         throw new Error(thumbnailValidationResult.message);
//       }
//     }

//     // Insert variant into the database
//     const [variantResult] = await connection.query(
//       `INSERT INTO variants (product_id, variant_type_id, value, price, quantity, status, created_by, updated_by)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         validatedData.product_id,
//         validatedData.variant_type_id,
//         validatedData.value,
//         validatedData.price,
//         validatedData.quantity,
//         validatedData.status,
//         validatedData.created_by,
//         validatedData.updated_by,
//       ]
//     );

//     const variantId = variantResult.insertId;
//     if (!variantId) {
//       throw new Error("Failed to create variant.");
//     }

//     // Convert images to buffers
//     const variantImageBuffer = await fileToBuffer(validatedData.variant_image);
//     const thumbnailBuffers = await Promise.all(
//       validatedData.variant_thumbnails.map(fileToBuffer)
//     );

//     //Insert images into the database
//     const [imageResult] = await connection.query(
//       `INSERT INTO product_variant_images
//          (variant_id, variant_image, variant_thumbnail1, variant_thumbnail2, variant_thumbnail3, variant_thumbnail4, variant_thumbnail5)
//         VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [
//         variantId,
//         variantImageBuffer,
//         ...thumbnailBuffers,
//         ...Array(5 - thumbnailBuffers.length).fill(null),
//       ]
//     );

//     if (!imageResult.insertId) {
//       throw new Error("Failed to insert variant images.");
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Variant created and images uploaded successfully.",
//       variantId,
//       imageId: imageResult.insertId,
//     });
//   });
// }
