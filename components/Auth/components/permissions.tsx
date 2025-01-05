"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Edit, Trash, Eye, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Filter, RowAction } from "@/components/Data-Table/types";
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
import { Button } from "@/components/ui/button";
import { PermissionForm } from "../Forms/PermissionForm";
import { fetchEntities } from "@/lib/actions/Auth/entities/actions";
import { hasPermissions } from "@/lib/actions/Auth/permissions/fetch";

type Entity = {
  entity_id: string;
  entity_name: string;
};

type Action = {
  action_id: string;
  action_name: string;
};

// Define the User type
export interface User {
  user_id: number;
  name: string;
}

export interface Permission {
  id: string;
  user_name: string;
  role: string;
  entity: string;
  action: string;
  has_permission: boolean;
}

const includedKeys: (keyof Permission)[] = [
  "user_name",
  "role",
  "entity",
  "action",
  "has_permission",
];

const columnRenderers: Partial<
  Record<keyof Permission, (item: Permission) => React.ReactNode>
> = {
  has_permission: (item: Permission) => (
    <Badge variant={item.has_permission ? "default" : "destructive"}>
      {item.has_permission}
    </Badge>
  ),
};

// Component
const Permission = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );
  const [sortKey, setSortKey] = useState<keyof Permission>("user_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, entitiesData, actionsData, permissionsData] =
          await Promise.all([
            fetchUsersWithRoles(),
            fetchEntities(),
            fetchActions(),
            hasPermissions(),
          ]);

        console.log("Permissions Data:", permissionsData);

        // Normalize permission keys
        const normalizedPermissions = permissionsData.map(
          (permission: any) => ({
            ...permission,
            hasPermission: permission.has_permission === "Yes",
          })
        );

        setUsers(usersData);
        setEntities(entitiesData);
        setActions(actionsData);
        setPermissions(normalizedPermissions);
      } catch (err: any) {
        setError(err.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    let result = searchData(permissions, searchTerm, "user_name");
    result = filterData(result, [], activeFilters);
    return sortData(result, sortKey, sortDirection);
  }, [permissions, searchTerm, activeFilters]);

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

  const [isOpen, setIsOpen] = useState(false); // To manage dialog state

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
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
    if (
      typeof key === "string" &&
      includedKeys.includes(key as keyof Permission)
    ) {
      setSortKey(key as keyof Permission); // Set sort key safely
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
        {/* Trigger Button */}
        <DialogTrigger asChild>
          <Button className="mb-4">
            <Plus className="mr-2 h-4 w-4" /> Add Permission
          </Button>
        </DialogTrigger>

        {/* Dialog Content */}
        <DialogContent>
          <PermissionForm users={users} entities={entities} actions={actions} />
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
          columnRenderers={columnRenderers} // Add this prop if your DataTable supports it
        />
      )}
    </div>
  );
};

export default Permission;
