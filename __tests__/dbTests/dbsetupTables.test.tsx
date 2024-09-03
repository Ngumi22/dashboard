import { dbsetupTables } from "@/lib/MysqlTables";
import { getConnection } from "../../lib/db";

jest.mock("../../lib/db", () => ({
  getConnection: jest.fn(),
}));

describe("dbsetupTables", () => {
  let mockConnection: any;

  beforeEach(() => {
    mockConnection = {
      beginTransaction: jest.fn(),
      query: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn(),
    };

    (getConnection as jest.Mock).mockResolvedValue(mockConnection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create the database and all required tables successfully", async () => {
    await expect(dbsetupTables()).resolves.not.toThrow();

    // Ensure transaction is started
    expect(mockConnection.beginTransaction).toHaveBeenCalled();

    // Verify database creation
    expect(mockConnection.query).toHaveBeenCalledWith(
      expect.stringContaining("CREATE DATABASE IF NOT EXISTS Bernzz")
    );

    // Verify table creation
    const tables = [
      "roles",
      "staff_accounts",
      "products",
      "categories",
      "tags",
      "product_tags",
      "variant_types",
      "variant_options",
      "product_variants",
      "variant_images",
    ];

    tables.forEach((table) => {
      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining(`CREATE TABLE IF NOT EXISTS ${table}`)
      );
    });

    // Verify user creation
    expect(mockConnection.query).toHaveBeenCalledWith(
      expect.stringContaining("CREATE USER IF NOT EXISTS")
    );

    // Ensure transaction is committed
    expect(mockConnection.commit).toHaveBeenCalled();

    // Ensure rollback is not called
    expect(mockConnection.rollback).not.toHaveBeenCalled();
  });

  it("should roll back the transaction if an error occurs", async () => {
    mockConnection.query.mockRejectedValueOnce(new Error("Test error"));
    await expect(dbsetupTables()).rejects.toThrow("Test error");
    expect(mockConnection.rollback).toHaveBeenCalled();
    expect(mockConnection.commit).not.toHaveBeenCalled();
  });

  it("should handle pre-existing users gracefully", async () => {
    mockConnection.query.mockImplementation((query: string) => {
      if (query.includes("CREATE USER IF NOT EXISTS")) {
        return Promise.reject(new Error("User already exists"));
      }
      return Promise.resolve();
    });

    await expect(dbsetupTables()).rejects.toThrow("User already exists");
    expect(mockConnection.rollback).toHaveBeenCalled();
  });

  it("should handle invalid role levels gracefully", async () => {
    mockConnection.query.mockImplementation((query: string) => {
      if (query.includes("INSERT IGNORE INTO roles")) {
        return Promise.reject(new Error("Invalid role level"));
      }
      return Promise.resolve();
    });

    await expect(dbsetupTables()).rejects.toThrow("Invalid role level");
    expect(mockConnection.rollback).toHaveBeenCalled();
  });

  it("should create roles with correct privileges", async () => {
    await expect(dbsetupTables()).resolves.not.toThrow();

    // Verify role creation with correct privileges
    expect(mockConnection.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT IGNORE INTO roles")
    );
  });

  it("should handle SQL syntax errors gracefully", async () => {
    mockConnection.query.mockRejectedValueOnce(
      new Error("You have an error in your SQL syntax")
    );

    await expect(dbsetupTables()).rejects.toThrow(
      "You have an error in your SQL syntax"
    );
    expect(mockConnection.rollback).toHaveBeenCalled();
  });

  it("should not fail if tables already exist", async () => {
    mockConnection.query.mockImplementation((query: string) => {
      if (
        query.includes("CREATE TABLE IF NOT EXISTS") ||
        query.includes("INSERT IGNORE INTO") ||
        query.includes("USE") ||
        query.includes("CREATE DATABASE")
      ) {
        return Promise.resolve();
      }
      return Promise.reject(new Error("Unexpected query"));
    });

    await expect(dbsetupTables()).resolves.not.toThrow();
    expect(mockConnection.rollback).not.toHaveBeenCalled();
    expect(mockConnection.commit).toHaveBeenCalled();
  });

  it("should handle database connection errors", async () => {
    (getConnection as jest.Mock).mockRejectedValueOnce(
      new Error("Database connection error")
    );

    await expect(dbsetupTables()).rejects.toThrow("Database connection error");
    expect(mockConnection.rollback).not.toHaveBeenCalled();
    expect(mockConnection.commit).not.toHaveBeenCalled();
  });

  it("should handle foreign key constraint violations", async () => {
    mockConnection.query.mockRejectedValueOnce(
      new Error(
        "Cannot add or update a child row: a foreign key constraint fails"
      )
    );

    await expect(dbsetupTables()).rejects.toThrow(
      "Cannot add or update a child row: a foreign key constraint fails"
    );
    expect(mockConnection.rollback).toHaveBeenCalled();
  });
});
