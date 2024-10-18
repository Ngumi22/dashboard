import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SubmitAction } from "@/lib/productSubmit";
import { ProductsForm } from "@/components/Product/Newer";

// Mock the entire productSubmit module
jest.mock("../../lib/productSubmit", () => ({
  SubmitAction: jest.fn(),
}));

describe("ProductsForm", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test("renders the form with all required fields", () => {
    render(<ProductsForm />);

    // Check if all main sections are present
    expect(screen.getByText("Create Product")).toBeInTheDocument();
    expect(screen.getByText("Basic Information")).toBeInTheDocument();
    expect(screen.getByText("Pricing and Inventory")).toBeInTheDocument();
    expect(screen.getByText("Brand Information")).toBeInTheDocument();
    expect(screen.getByText("Category Information")).toBeInTheDocument();
    expect(screen.getByText("Product Images")).toBeInTheDocument();
    expect(screen.getByText("Tags")).toBeInTheDocument();

    // Check for some specific fields
    expect(screen.getByLabelText("Product Name")).toBeInTheDocument();
    expect(screen.getByLabelText("SKU")).toBeInTheDocument();
    expect(screen.getByLabelText("Price")).toBeInTheDocument();
  });

  test("allows adding and removing tags", async () => {
    render(<ProductsForm />);

    const addTagButton = screen.getByText("Add Tag");
    fireEvent.click(addTagButton);

    const tagInputs = await screen.findAllByPlaceholderText("Enter tag");
    expect(tagInputs).toHaveLength(2); // Initial tag input + new one

    const removeButtons = screen.getAllByRole("button", { name: "Remove tag" });
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(screen.getAllByPlaceholderText("Enter tag")).toHaveLength(1);
    });
  });

  test("handles form submission", async () => {
    render(<ProductsForm />);

    // Fill out some form fields
    fireEvent.change(screen.getByLabelText("Product Name"), {
      target: { value: "Test Product" },
    });
    fireEvent.change(screen.getByLabelText("SKU"), {
      target: { value: "TEST-SKU-001" },
    });
    fireEvent.change(screen.getByLabelText("Price"), {
      target: { value: "99.99" },
    });

    // Submit the form
    fireEvent.click(screen.getByText("Submit Product"));

    // Check if SubmitAction was called
    await waitFor(() => {
      expect(SubmitAction).toHaveBeenCalled();
    });
  });

  test("displays validation errors for required fields", async () => {
    render(<ProductsForm />);

    // Submit the form without filling any fields
    fireEvent.click(screen.getByText("Submit Product"));

    // Check for error messages
    await waitFor(() => {
      expect(screen.getByText("Product name is required")).toBeInTheDocument();
      expect(screen.getByText("SKU is required")).toBeInTheDocument();
      expect(screen.getByText("Price is required")).toBeInTheDocument();
    });
  });

  test("handles image upload and preview", async () => {
    render(<ProductsForm />);

    const file = new File(["dummy content"], "test.png", { type: "image/png" });
    const mainImageInput = screen.getByLabelText("Main Image");

    fireEvent.change(mainImageInput, { target: { files: [file] } });

    // Check if the preview image is displayed
    await waitFor(() => {
      expect(screen.getByAltText("Main Preview")).toBeInTheDocument();
    });
  });
});
