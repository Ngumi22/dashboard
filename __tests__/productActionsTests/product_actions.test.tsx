import { getConnection } from "@/lib/database";
import { addCategory, addBrand, createSupplier } from "@/lib/product_actions";
import { NextResponse } from "next/server";

jest.mock("./database");
jest.mock("next/server");

describe("Server Functions", () => {
  let mockConnection: any;

  beforeEach(() => {
    mockConnection = {
      query: jest.fn(),
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn(),
    };
    (getConnection as jest.Mock).mockResolvedValue(mockConnection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addCategory", () => {
    it("should add a new category successfully", async () => {
      const formData = new FormData();
      formData.append("categoryName", "TestCategory");
      formData.append("categoryDescription", "A test category");
      const mockFile = new File(["dummy content"], "testImage.png", {
        type: "image/png",
      });
      formData.append("categoryImage", mockFile);

      mockConnection.query.mockResolvedValueOnce([[]]); // No existing category
      mockConnection.query.mockResolvedValueOnce([{ insertId: 1 }]); // Insert query result

      const response = await addCategory(formData);

      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.query).toHaveBeenCalledWith(
        "SELECT category_id FROM categories WHERE name = ?",
        ["TestCategory"]
      );
      expect(mockConnection.query).toHaveBeenCalledWith(
        "INSERT INTO categories (name, category_image, description, created_by, updated_by) VALUES (?, ?, ?, ?, ?)",
        ["TestCategory", expect.any(Buffer), "A test category", null, null]
      );
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Category created successfully",
        categoryId: 1,
      });
      expect(mockConnection.commit).toHaveBeenCalled();
    });

    it("should return error if category already exists", async () => {
      const formData = new FormData();
      formData.append("categoryName", "TestCategory");

      mockConnection.query.mockResolvedValueOnce([{ category_id: 1 }]); // Existing category

      await expect(addCategory(formData)).rejects.toThrow(
        "Category already exists"
      );
      expect(mockConnection.rollback).toHaveBeenCalled();
    });
  });

  describe("addBrand", () => {
    it("should add a new brand successfully", async () => {
      const formData = new FormData();
      formData.append("brandName", "TestBrand");
      const mockFile = new File(["dummy content"], "brandLogo.png", {
        type: "image/png",
      });
      formData.append("brandImage", mockFile);

      mockConnection.query.mockResolvedValueOnce([[]]); // No existing brand
      mockConnection.query.mockResolvedValueOnce([{ insertId: 1 }]); // Insert query result

      const response = await addBrand(formData);

      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.query).toHaveBeenCalledWith(
        "SELECT brand_id FROM brands WHERE name = ?",
        ["TestBrand"]
      );
      expect(mockConnection.query).toHaveBeenCalledWith(
        "INSERT INTO brands (name, brand_logo, created_by, updated_by) VALUES (?, ?, ?, ?)",
        ["TestBrand", expect.any(Buffer), null, null]
      );
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Brand added successfully",
        brandId: 1,
      });
      expect(mockConnection.commit).toHaveBeenCalled();
    });

    it("should throw error if brand already exists", async () => {
      const formData = new FormData();
      formData.append("brandName", "TestBrand");

      mockConnection.query.mockResolvedValueOnce([{ brand_id: 1 }]); // Existing brand

      await expect(addBrand(formData)).rejects.toThrow("Brand already exists");
      expect(mockConnection.rollback).toHaveBeenCalled();
    });
  });

  describe("createSupplier", () => {
    it("should create a supplier successfully", async () => {
      const formData = new FormData();
      formData.append("name", "Test Supplier");
      formData.append(
        "contact_info",
        JSON.stringify({ email: "test@supplier.com" })
      );
      formData.append("created_by", "Admin");
      formData.append("updated_by", "Admin");

      mockConnection.query.mockResolvedValueOnce([{ insertId: 1 }]); // Insert query result

      const response = await createSupplier(formData);

      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.query).toHaveBeenCalledWith(
        "INSERT INTO suppliers (name, contact_info, created_by, updated_by) VALUES (?, ?, ?, ?)",
        ["Test Supplier", '{"email":"test@supplier.com"}', "Admin", "Admin"]
      );
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Supplier created successfully",
        supplierId: 1,
      });
      expect(mockConnection.commit).toHaveBeenCalled();
    });

    it("should throw error if no supplier data provided", async () => {
      const formData = new FormData();
      await expect(createSupplier(formData)).rejects.toThrow(
        "No supplier data provided"
      );
    });
  });
});
