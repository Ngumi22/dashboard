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
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { fetchUsersWithRoles } from "@/lib/actions/Auth/users/fetch";
import { fetchEntities } from "@/lib/actions/Auth/entities/actions";
import { Button } from "@/components/ui/button";
import { EntityForm } from "../Forms/EntityForm";

type Entity = {
  entity_id: string;
  entity_name: string;
};

const includedKeys: (keyof Entity)[] = ["entity_id", "entity_name"];

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
const Entities = () => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );
  const [sortKey, setSortKey] = useState<keyof Entity>("entity_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [isOpen, setIsOpen] = useState(false); // To manage dialog state

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const Entities = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchEntities(); // Replace with your actual endpoint

      // Correct the property names to match the data structure
      const transformedEntities: Entity[] = data.map((entity: Entity) => ({
        entity_id: entity.entity_id, // Ensure you're using correct property names here
        entity_name: entity.entity_name, // Same as above
      }));

      console.log(transformedEntities);

      setEntities(transformedEntities);
    } catch (error: any) {
      setError(error.message || "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Entities();
  }, []);

  // Dynamically generate category options from the products data
  const entitiesOptions = useMemo(() => {
    const uniqueEntities = Array.from(
      new Set(entities.map((entity) => entity.entity_name))
    );
    return Array.from(uniqueEntities).map((entities) => ({
      value: entities,
      label: entities,
    }));
  }, [entities]);

  const filters = useMemo(() => [], [entitiesOptions]);

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
    let result = searchData(entities, searchTerm, "entity_name");
    result = filterData(result, filters, activeFilters);

    return result;
  }, [entities, searchTerm, activeFilters, sortKey, sortDirection, filters]);

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
    if (typeof key === "string" && includedKeys.includes(key as keyof Entity)) {
      setSortKey(key as keyof Entity); // Set sort key safely
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
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-end">
            Create Entity
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <EntityForm />
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
          onAddNew={() => handleOpenChange(true)}
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

export default Entities;
