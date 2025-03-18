import { getErrorMessage } from "../utils";
import { getConnection } from "./initDb";

/**
 * Core database operation with transaction support and retry logic.
 * @param operation - The function to execute within the transaction.
 * @param retries - Number of retries in case of deadlocks (default: 3).
 * @returns The result of the operation.
 */
export async function dbOperation<T>(
  operation: (connection: any) => Promise<T>,
  retries = 3
): Promise<T> {
  let attempt = 0;

  while (attempt < retries) {
    const connection = await getConnection();

    try {
      // Start the transaction
      await connection.beginTransaction();

      // Execute the operation
      const result = await operation(connection);

      // Commit the transaction if successful
      await connection.commit();
      return result;
    } catch (error: any) {
      // Rollback the transaction on error
      await connection.rollback();

      // Retry on deadlock
      if (error.message.includes("Deadlock") && attempt < retries - 1) {
        console.warn(
          `Deadlock detected. Retrying... (${attempt + 1}/${retries})`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, 100 * (attempt + 1))
        );
      } else {
        // Log and re-throw the original error
        console.error(`Database operation failed: ${getErrorMessage(error)}`);
        throw error; // Re-throw the original error for better debugging
      }
    } finally {
      // Always release the connection back to the pool
      connection.release();
    }

    attempt++;
  }

  // Throw an error if max retries are reached
  throw new Error("Max retries reached for database operation.");
}
