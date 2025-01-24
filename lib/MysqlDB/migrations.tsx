import { getConnection } from "./initDb";
import { dbsetupTables } from "./tables";

export async function runMigrations() {
  const connection = await getConnection();
  try {
    // Ensure schema_version table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schema_version (
        version INT NOT NULL UNIQUE,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get current schema version
    const [rows]: any = await connection.query(
      `SELECT MAX(version) as currentVersion FROM schema_version`
    );
    const currentVersion = rows[0]?.currentVersion || 0;

    const newVersion = 1; // Increment this when schema changes are made

    if (currentVersion < newVersion) {
      console.log(
        `Updating schema from version ${currentVersion} to ${newVersion}...`
      );
      await dbsetupTables(); // Apply schema changes
      await connection.query(
        `INSERT INTO schema_version (version) VALUES (?)`,
        [newVersion]
      );
      console.log("Schema updated successfully.");
    } else {
      console.log("Schema is already up to date.");
    }
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    connection.release();
  }
}
