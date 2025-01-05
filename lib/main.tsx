"use server";

import { initDbConnection } from "./db";
import { setupTables } from "./dbTables";
import { createIndexes } from "./MysqlDB/indexdb";

// This main script imports the necessary modules and initializes them in the correct order

export async function initialize() {
  try {
    await initDbConnection();
    await setupTables();
    await createIndexes();
  } catch (error) {
    console.error("Initialization error:", error);
  }
}
