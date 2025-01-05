"use server";

import { cache } from "@/lib/cache"; // Assuming you have a cache system in place
import { getConnection } from "@/lib/MysqlDB/initDb";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export async function fetchEntities() {
  const cacheKey = "entities";

  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value;
    }
    cache.delete(cacheKey);
  }

  const connection = await getConnection();
  try {
    const [entities] = await connection.query<RowDataPacket[]>(
      `SELECT entity_id, entity_name, created_at, updated_at FROM entities ORDER BY entity_id DESC`
    );

    if (entities.length === 0) {
      return null;
    }

    const formattedEntities = entities.map((entity) => ({
      entity_id: entity.entity_id,
      entity_name: entity.entity_name,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    }));

    cache.set(cacheKey, {
      value: formattedEntities,
      expiry: Date.now() + 3600,
    });

    return formattedEntities;
  } catch (error) {
    console.error("Error fetching entities:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function createEntity(formData: FormData) {
  const entityName = formData.get("entity_name") as string;
  const connection = await getConnection();
  try {
    // Check if the category already exists
    const [existingEntity] = await connection.query<RowDataPacket[]>(
      "SELECT entity_id FROM entities WHERE entity_name = ?",
      [entityName]
    );

    if (existingEntity.length > 0) {
      return {
        success: true,
        message: "Entity already exists",
        entityId: existingEntity[0].entity_id,
      };
    }
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO entities (entity_name) VALUES (?)`,
      [entityName]
    );

    return {
      success: true,
      entity: { id: result.insertId, entity_name: entityName },
    };
  } catch (error) {
    console.error("Error creating entity:", error);
    return { success: false, error: "Failed to create entity" };
  } finally {
    connection.release();
  }
}

export async function updateEntity(formData: FormData) {
  const entityId = formData.get("id") as string;
  const entityName = formData.get("entity_name") as string;
  const connection = await getConnection();
  try {
    await connection.query<ResultSetHeader>(
      `UPDATE entities SET entity_name = ? WHERE id = ?`,
      [entityName, entityId]
    );

    return {
      success: true,
      entity: { id: parseInt(entityId), entity_name: entityName },
    };
  } catch (error) {
    console.error("Error updating entity:", error);
    return { success: false, error: "Failed to update entity" };
  } finally {
    connection.release();
  }
}

export async function deleteEntity(entityId: number) {
  const connection = await getConnection();
  try {
    await connection.query<ResultSetHeader>(
      `DELETE FROM entities WHERE entity_id = ?`,
      [entityId]
    );

    return { success: true, entity_id: entityId };
  } catch (error) {
    console.error("Error deleting entity:", error);
    throw error;
  } finally {
    connection.release();
  }
}
