"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

// Mock placeholder data for existing suppliers (This should be fetched from a database)
const placeholderSuppliers = [
  {
    supplier_id: 1,
    name: "Supplier A",
    contact_info: {
      phone: "123-456-7890",
      address: "123 Supplier St",
      email: "supplierA@example.com",
    },
  },
  {
    supplier_id: 2,
    name: "Supplier B",
    contact_info: {
      phone: "234-567-8901",
      address: "234 Supplier Ave",
      email: "supplierB@example.com",
    },
  },
];

interface AddSupplierProps {
  onSupplierChange: (supplierData: any) => void; // Function to handle the supplier object
}

const AddSupplier = ({ onSupplierChange }: AddSupplierProps) => {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(""); // Track selected supplier
  const [isAddingNewSupplier, setIsAddingNewSupplier] = useState(false); // Toggle new supplier form
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contact_info: {
      phone: "",
      address: "",
      email: "",
    },
  }); // New supplier data

  // Handle selecting an existing supplier
  const handleSelectSupplier = (value: string) => {
    setSelectedSupplierId(value);
    const selectedSupplier = placeholderSuppliers.find(
      (supplier) => supplier.supplier_id.toString() === value
    );
    if (selectedSupplier) {
      onSupplierChange({ supplier: selectedSupplier });
    }
    setIsAddingNewSupplier(false); // Hide new supplier form if existing supplier is selected
  };

  // Handle adding new supplier
  const handleAddNewSupplier = () => {
    setIsAddingNewSupplier(true);
    setSelectedSupplierId(""); // Clear existing supplier selection
    onSupplierChange(null); // Clear supplier data
  };

  // Handle form submission for new supplier
  const handleSaveNewSupplier = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault(); // Prevent form submission
    if (newSupplier.name && newSupplier.contact_info.email) {
      // Validate necessary fields
      onSupplierChange({
        supplier: {
          newSupplier: newSupplier,
        },
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Supplier</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Step 1: Select an existing supplier */}
        <div>
          <label>Select Existing Supplier</label>
          <Select
            value={selectedSupplierId}
            onValueChange={handleSelectSupplier} // Update selected supplier
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a supplier" />
            </SelectTrigger>
            <SelectContent>
              {placeholderSuppliers.map((supplier) => (
                <SelectItem
                  key={supplier.supplier_id}
                  value={supplier.supplier_id.toString()}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Button to add a new supplier */}
        <Button type="button" onClick={handleAddNewSupplier}>
          Add New Supplier
        </Button>

        {/* Step 2: If adding new supplier, show the form */}
        {isAddingNewSupplier && (
          <>
            <div>
              <label>Supplier Name</label>
              <Input
                placeholder="Enter Supplier Name"
                value={newSupplier.name}
                onChange={(e) =>
                  setNewSupplier((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label>Phone</label>
              <Input
                placeholder="Enter Phone Number"
                value={newSupplier.contact_info.phone}
                onChange={(e) =>
                  setNewSupplier((prev) => ({
                    ...prev,
                    contact_info: {
                      ...prev.contact_info,
                      phone: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div>
              <label>Address</label>
              <Input
                placeholder="Enter Address"
                value={newSupplier.contact_info.address}
                onChange={(e) =>
                  setNewSupplier((prev) => ({
                    ...prev,
                    contact_info: {
                      ...prev.contact_info,
                      address: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div>
              <label>Email</label>
              <Input
                placeholder="Enter Email"
                value={newSupplier.contact_info.email}
                onChange={(e) =>
                  setNewSupplier((prev) => ({
                    ...prev,
                    contact_info: {
                      ...prev.contact_info,
                      email: e.target.value,
                    },
                  }))
                }
              />
            </div>

            {/* Save new supplier button */}
            <Button type="button" onClick={handleSaveNewSupplier}>
              Save New Supplier
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AddSupplier;
