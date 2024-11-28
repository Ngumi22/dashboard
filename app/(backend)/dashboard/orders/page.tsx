"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, FileDown, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@radix-ui/react-checkbox";
import Image from "next/image";
import CategoryForm from "@/components/Categories/form";

interface Category {
  category_id?: number;
  category_name: string;
  category_image: string | File;
  category_description: string;
  status: "active" | "inactive";
}

interface CategoryData {
  category_id: number;
  category_name: string;
  category_image: string;
  category_description: string;
  status: "active" | "inactive";
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryData[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:3000/api/category");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize the filterCategories function with useCallback
  const filterCategories = useCallback(() => {
    let filtered = categories;
    if (statusFilter !== "All") {
      filtered = filtered.filter(
        (category) =>
          category.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    if (searchTerm) {
      filtered = filtered.filter((category) =>
        category.category_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredCategories(filtered);
  }, [categories, searchTerm, statusFilter]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      filterCategories();
    }
  }, [categories, searchTerm, statusFilter, isLoading, filterCategories]);

  const handleStatusChange = (value: string) => setStatusFilter(value);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(event.target.value);

  const handleSelectCategory = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === filteredCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(filteredCategories.map((c) => c.category_id));
    }
  };

  const handleDelete = async (categoryId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/category/${categoryId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete category");
      setCategories((prev) => prev.filter((c) => c.category_id !== categoryId));
      toast({
        title: "Category deleted",
        description: "Successfully deleted.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete category.",
        variant: "destructive",
      });
    }
  };

  const exportData = () => {
    const dataToExport = filteredCategories.map(
      ({ category_id, category_name, status }) => ({
        category_id,
        category_name,
        status,
      })
    );
    const csvContent =
      "data:text/csv;charset=utf-8," +
      Object.keys(dataToExport[0]).join(",") +
      "\n" +
      dataToExport.map((row) => Object.values(row).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "categories.csv");
    link.click();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setIsDialogOpen(true);
          }}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-64"
          />
          <Select onValueChange={handleStatusChange} defaultValue="All">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={exportData}>
          <FileDown className="mr-2 h-4 w-4" /> Export
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center">
          <p>Loading....</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center">No categories found.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    selectedCategories.length === filteredCategories.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Id</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((category) => (
              <TableRow key={category.category_id}>
                <TableCell className="font-medium">
                  <Checkbox
                    checked={selectedCategories.includes(category.category_id)}
                    onCheckedChange={() =>
                      handleSelectCategory(category.category_id)
                    }
                  />
                </TableCell>
                <TableCell>{category.category_id}</TableCell>
                <TableCell>
                  <Image
                    src={`data:image/jpeg;base64,${category.category_image}`}
                    alt={category.category_name}
                    width={50}
                    height={50}
                    className="rounded-md"
                  />
                </TableCell>
                <TableCell>{category.category_name}</TableCell>
                <TableCell>{category.category_description}</TableCell>
                <TableCell>
                  <span
                    className={`${
                      category.status === "active"
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}>
                    {category.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        setEditingCategory(category);
                        setIsDialogOpen(true);
                      }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleDelete(category.category_id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[40rem]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Modify the category details below."
                : "Create a new category."}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            initialData={editingCategory || undefined}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
