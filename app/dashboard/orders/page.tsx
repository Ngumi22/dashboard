"use client";
import { useState, useEffect } from "react";
import { Plus, Search, FileDown, Edit, Trash2, X } from "lucide-react";
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
import CategoryForm from "@/components/Categories/create";
import { Checkbox } from "@radix-ui/react-checkbox";
import Image from "next/image";

interface Category {
  category_id: number;
  category_name: string;
  category_image: string;
  category_description: string;
  status: "active" | "inactive";
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      filterCategories();
    }
  }, [categories, searchTerm, statusFilter, isLoading]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:3000/api/category");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setError("Failed to load categories. Please try again later.");
    } finally {
      setIsLoading(false); // Once the fetch is done, set isLoading to false
    }
  };

  const filterCategories = () => {
    let filtered = categories;

    // Normalize the status comparison by converting both to lowercase
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
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

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

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsEditDrawerOpen(true);
  };

  const handleDelete = async (categoryId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/category/${categoryId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete category");
      }
      setCategories((prev) => prev.filter((c) => c.category_id !== categoryId));
      toast({
        title: "Category deleted",
        description: "The category has been successfully deleted.",
      });
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast({
        title: "Error",
        description: "Failed to delete the category. Please try again.",
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
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[40rem]">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a new category here. Click save when you are done.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        {editingCategory && (
          <Dialog open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen}>
            <DialogContent className="sm:max-w-[40rem]">
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogDescription>
                  Update the category details below. Click save when done.
                </DialogDescription>
              </DialogHeader>
              {editingCategory && (
                <Dialog
                  open={isEditDrawerOpen}
                  onOpenChange={setIsEditDrawerOpen}>
                  <DialogContent className="sm:max-w-[40rem]">
                    <DialogHeader>
                      <DialogTitle>Edit Category</DialogTitle>
                      <DialogDescription>
                        Update the category details below. Click save when done.
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              )}
            </DialogContent>
          </Dialog>
        )}
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
                <TableCell>
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
                    className="rounded"
                    height={40}
                    width={40}
                    alt={category.category_name}
                    src={`data:image/jpeg;base64,${category.category_image}`}
                  />
                </TableCell>
                <TableCell>{category.category_name}</TableCell>
                <TableCell>{category.category_description}</TableCell>
                <TableCell>{category.status}</TableCell>
                <TableCell className="space-x-4">
                  <Button
                    onClick={() => handleEdit(category)}
                    variant="outline">
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(category.category_id)}>
                    <Trash2 className="mr-2 h-4 w-4 mx-auto" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
