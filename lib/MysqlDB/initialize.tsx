import { initDbConnection } from "./initDb";
import { dbsetupTables } from "./tables";

let isInitialized = false; // Global flag to prevent redundant initialization

/**
 * Initializes the database and ensures the schema is up to date.
 */

export async function initialize(): Promise<void> {
  if (isInitialized) {
    console.log("Database is already initialized.");
    return;
  }

  try {
    const pool = await initDbConnection();
    const connection = await pool.getConnection();

    try {
      // Ensure schema versioning table exists
      await connection.query(`
        CREATE TABLE IF NOT EXISTS schema_version (
          version INT NOT NULL UNIQUE,
          applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Check the current schema version
      const [rows]: any = await connection.query(
        `SELECT MAX(version) as currentVersion FROM schema_version`
      );
      const currentVersion = rows[0]?.currentVersion || 0;

      const newVersion = 1; // Increment this version when schema updates are required

      if (currentVersion < newVersion) {
        console.log(
          `Updating schema from version ${currentVersion} to ${newVersion}...`
        );

        // Apply schema updates
        await dbsetupTables();

        // Record the new version in schema_version
        await connection.query(
          `INSERT INTO schema_version (version) VALUES (?)`,
          [newVersion]
        );
        console.log("Schema updated successfully.");
      } else {
        console.log("Schema is already up to date.");
      }

      isInitialized = true; // Mark as initialized
    } finally {
      connection.release();
      console.log("Connection released.");
    }
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}
