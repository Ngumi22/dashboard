"use server";
import { cache } from "../cache";
import { getConnection } from "../database";
import { NextResponse } from "next/server";
import { FieldPacket, RowDataPacket } from "mysql2/promise";

// Define the Category type
type Category = {
  category_id: string;
  category_name: string;
  category_image: Buffer | null;
  category_description: string;
  status: "active" | "inactive";
};

export async function getUniqueCategories() {
  const cacheKey = "unique_categories";

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    console.log("Returning categories from cache");
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value; // Return cached data if it hasn't expired
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  const connection = await getConnection();
  try {
    // Fetch all unique categories with name, image, and description
    const [categories] = await connection.query<RowDataPacket[]>(
      `SELECT category_id, category_name, category_image, category_description, status FROM categories`
    );

    // Map the result to include the full category details
    const uniqueCategories: Category[] = categories.map((cat) => ({
      category_id: cat.category_id,
      category_name: cat.category_name,
      category_image: cat.category_image,
      category_description: cat.category_description,
      status: cat.status,
    }));

    // Cache the result with an expiry time
    cache.set(cacheKey, {
      value: uniqueCategories,
      expiry: Date.now() + 3600 * 1000, // 1 hour expiration
    });

    return uniqueCategories;
  } catch (error) {
    console.error("Error fetching unique categories:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function fetchCategoryByIdFromDb(
  id: string
): Promise<Category | null> {
  const cacheKey = `category_${id}`;

  // Check cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as Category;
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  const connection = await getConnection();
  try {
    // Query the database
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      `SELECT category_id, category_name, category_image, category_description, status FROM categories WHERE category_id = ?`,
      [id]
    );

    // If no rows are returned, return null
    if (rows.length === 0) {
      return null;
    }

    // Map database results to a Category object
    const category: Category = {
      category_id: rows[0].category_id,
      category_name: rows[0].category_name,
      category_image: rows[0].category_image,
      category_description: rows[0].category_description,
      status: rows[0].status,
    };

    // Cache the result
    cache.set(cacheKey, {
      value: category,
      expiry: Date.now() + 3600 * 1000, // Cache expiry: 1 hour
    });

    return category;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Failed to fetch category");
  } finally {
    connection.release();
  }
}

export async function deleteCategory(
  category_id: string
): Promise<NextResponse> {
  const cacheKey = `category_${category_id}`;
  const connection = await getConnection();

  try {
    // Start a transaction
    await connection.beginTransaction();

    // Check if the category exists
    const [categoryRows]: [RowDataPacket[], FieldPacket[]] =
      await connection.execute(
        "SELECT category_id FROM categories WHERE category_id = ? FOR UPDATE",
        [category_id]
      );

    if (categoryRows.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Delete the category (products will be deleted automatically due to ON DELETE CASCADE)
    const [result] = await connection.execute(
      `DELETE FROM categories WHERE category_id = ?`,
      [category_id]
    );

    // If no rows were deleted, the category does not exist
    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Remove from cache to ensure it does not contain stale data
    cache.delete(cacheKey);

    // Commit the transaction
    await connection.commit();

    return NextResponse.json(
      { message: "Category and associated products deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting category:", error);

    // Rollback the transaction in case of error
    await connection.rollback();

    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  } finally {
    // Release the connection
    connection.release();
  }
}
