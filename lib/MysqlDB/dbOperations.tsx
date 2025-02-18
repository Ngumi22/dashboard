import { getErrorMessage } from "../utils";
import { getConnection } from "./initDb";

// Core database operation with transaction and retry
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
        console.error(`[Server Error]: ${getErrorMessage(error)}`);
        throw new Error(getErrorMessage(error));
      }
    } finally {
      connection.release();
    }

    attempt++;
  }

  throw new Error("Max retries reached for database operation.");
}
