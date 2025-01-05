"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Edit, Trash, Eye, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Filter,
  Product,
  RowAction,
  User,
} from "@/components/Data-Table/types";
import {
  filterData,
  searchData,
  sortData,
} from "@/components/Data-Table/utils";
import DataTable from "@/components/Data-Table/data-table";
import { useRouter } from "next/navigation";

import { fetchUsersWithRoles } from "@/lib/actions/Auth/users/fetch";
import { fetchActions } from "@/lib/actions/Auth/actions/actions";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ActionForm } from "../Forms/ActionForm";
import { Button } from "@/components/ui/button";

type Action = {
  action_id: string;
  action_name: string;
};

const includedKeys: (keyof Action)[] = ["action_id", "action_name"];

const columnRenderers = {
  status: (item: { status: string }) => (
    <Badge
      variant={
        item.status === "approved"
          ? "default"
          : item.status === "pending"
          ? "secondary"
          : "destructive"
      }>
      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
    </Badge>
  ),
};

// Component
const Actions = () => {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );
  const [sortKey, setSortKey] = useState<keyof Action>("action_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const Actions = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchActions(); // Replace with your actual endpoint

      // Correct the property names to match the data structure
      const transformedAction: Action[] = data.map((action: Action) => ({
        action_id: action.action_id, // Ensure you're using correct property names here
        action_name: action.action_name, // Same as above
      }));

      console.log(transformedAction);

      setActions(transformedAction);
    } catch (error: any) {
      setError(error.message || "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Actions();
  }, []);

  // Dynamically generate category options from the products data
  const actionsOptions = useMemo(() => {
    const uniqueActions = Array.from(
      new Set(actions.map((action) => action.action_name))
    );
    return Array.from(uniqueActions).map((actions) => ({
      value: actions,
      label: actions,
    }));
  }, [actions]);

  const filters = useMemo(() => [], [actionsOptions]);

  const rowActions: RowAction<any>[] = [
    {
      label: "Edit",
      icon: Edit,
      onClick: (product) => {
        // Navigate to the edit page
        router.push(`/dashboard/products/${product.product_id}/edit`);
      },
    },
    {
      label: "Delete",
      icon: Trash,
      onClick: async (product) => {
        // Confirm and delete the product
        const confirmed = window.confirm(
          `Are you sure you want to delete ${product.name}?`
        );
        const currentPage = 1; // Example current page
        if (confirmed) {
          try {
            const response = await fetch(`/api/users`, {
              method: "DELETE",
            });
            if (response.ok) {
              alert(`Product ${product.name} deleted successfully.`);
              // Optionally refresh the product list
              fetchUsersWithRoles();
            } else {
              alert(`Failed to delete product: ${product.name}`);
            }
          } catch (error) {
            console.error("Delete error:", error);
            alert(
              `An error occurred while deleting the product: ${product.name}`
            );
          }
        }
      },
    },
    {
      label: "View",
      icon: Eye,
      onClick: (product) => {
        router.push(`/dashboard/products/${product.product_id}/product`);
      },
    },
  ];

  const filteredAndSortedData = useMemo(() => {
    let result = searchData(actions, searchTerm, "action_name");
    result = filterData(result, filters, activeFilters);

    return result;
  }, [actions, searchTerm, activeFilters, sortKey, sortDirection, filters]);

  const paginatedData = useMemo(
    () =>
      filteredAndSortedData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
      ),
    [filteredAndSortedData, currentPage, rowsPerPage]
  );

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    setCurrentPage(1);
  };

  const handleFilter = (key: string, value: string) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      if (newFilters[key]) {
        const index = newFilters[key].indexOf(value);
        if (index > -1) {
          newFilters[key] = newFilters[key].filter((v) => v !== value);
          if (newFilters[key].length === 0) {
            delete newFilters[key];
          }
        } else {
          newFilters[key].push(value);
        }
      } else {
        newFilters[key] = [value];
      }
      return newFilters;
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setActiveFilters({});
    setCurrentPage(1);
  };

  const handleSort = (key: string | number | symbol) => {
    if (typeof key === "string" && includedKeys.includes(key as keyof Action)) {
      setSortKey(key as keyof Action); // Set sort key safely
    } else {
      console.error("Invalid sort key:", key);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsersWithRoles(); // Fetch data for the new page
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  const handleRowSelect = (selectedRows: any[]) => {
    console.log("Selected rows:", selectedRows);
  };

  const handleAddNew = () => {
    console.log("Add new item");
  };

  const handleClearFilter = (key: string, value: string) => {
    const newActiveFilters = { ...activeFilters };
    newActiveFilters[key] = newActiveFilters[key].filter((v) => v !== value);
    if (newActiveFilters[key].length === 0) {
      delete newActiveFilters[key];
    }
    setActiveFilters(newActiveFilters);
  };

  return (
    <div className="container mx-auto py-10">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="">
            Create Action
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <ActionForm />
        </DialogContent>
      </Dialog>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <DataTable
          data={paginatedData}
          includedKeys={includedKeys}
          filters={filters}
          rowActions={rowActions}
          onSearch={handleSearch}
          onFilter={handleFilter}
          onSort={handleSort}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onRowSelect={handleRowSelect}
          onAddNew={handleAddNew}
          totalItems={filteredAndSortedData.length}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          activeFilters={activeFilters}
          onClearFilter={handleClearFilter}
          onResetFilters={handleResetFilters}
          columnRenderers={columnRenderers}
        />
      )}
    </div>
  );
};

export default Actions;
