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
      await connection.beginTransaction();
      const result = await operation(connection);
      await connection.commit();
      return result;
    } catch (error: any) {
      await connection.rollback();

      if (error.message.includes("Deadlock") && attempt < retries - 1) {
        console.warn(
          `Deadlock detected. Retrying... (${attempt + 1}/${retries})`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, 100 * (attempt + 1))
        );
      } else {
        console.error(`Database operation failed: ${getErrorMessage(error)}`);
        throw error;
      }
    } finally {
      connection.release();
    }

    attempt++;
  }

  throw new Error("Max retries reached for database operation.");
}
