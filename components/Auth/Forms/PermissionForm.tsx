"use client";

import { useTransition, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createPermission,
  deletePermission,
  updatePermission,
} from "@/lib/actions/Auth/permissions/post";

type Entity = {
  entity_id: string;
  entity_name: string;
};

type Action = {
  action_id: string;
  action_name: string;
};

type Role = {
  role_id: string;
  role_name: string;
};

// Define the User type
export interface User {
  user_id: number;
  name: string;
}

export interface Permission {
  id: string;
  userId: string;
  entityId: string;
  actionId: string;
  hasPermission: boolean;
}

interface PermissionFormProps {
  permission?: Permission;
  users: User[];
  entities: Entity[];
  actions: Action[];
}

export function PermissionForm({
  permission,
  users,
  entities,
  actions,
}: PermissionFormProps) {
  const [formData, setFormData] = useState<Permission>({
    id: permission?.id || "",
    userId: permission?.userId || "",
    entityId: permission?.entityId || "",
    actionId: permission?.actionId || "",
    hasPermission: permission?.hasPermission || false,
  });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (permission) {
      setFormData(permission);
    }
  }, [permission]);

  const handleChange = (field: keyof Permission, value: string | boolean) => {
    //Updated handleChange type
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    startTransition(async () => {
      if (permission) {
        const result = await updatePermission(new FormData(form));
        if (result.success) {
          console.log("Permission updated successfully");
        } else {
          console.error("Error updating permission:", result.error);
        }
      } else {
        const result = await createPermission(new FormData(form));
        if (result.success) {
          console.log("Permission created successfully");
        } else {
          console.error("Error creating permission:", result.error);
        }
      }
    });
  };

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (permission) {
      startTransition(async () => {
        const formData = new FormData();
        formData.append("permissionId", permission.id);
        const result = await deletePermission(formData);
        if (result.success) {
          console.log("Permission deleted successfully");
        } else {
          console.error("Error deleting permission:", result.error);
        }
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {permission && (
        <input type="hidden" name="permissionId" value={permission.id} />
      )}

      <div>
        <Label htmlFor="userId">User</Label>
        <Select
          name="userId"
          value={formData.userId}
          onValueChange={(value) => handleChange("userId", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.user_id} value={String(user.user_id)}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="entityId">Entity</Label>
        <Select
          name="entityId"
          value={formData.entityId}
          onValueChange={(value) => handleChange("entityId", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select entity" />
          </SelectTrigger>
          <SelectContent>
            {entities.map((entity) => (
              <SelectItem
                key={entity.entity_id}
                value={String(entity.entity_id)}>
                {entity.entity_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="actionId">Action</Label>
        <Select
          name="actionId"
          value={formData.actionId}
          onValueChange={(value) => handleChange("actionId", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select action" />
          </SelectTrigger>
          <SelectContent>
            {actions.map((action) => (
              <SelectItem
                key={action.action_id}
                value={String(action.action_id)}>
                {action.action_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="hasPermission"
          name="hasPermission"
          checked={formData.hasPermission}
          onCheckedChange={(checked) => handleChange("hasPermission", checked)}
        />
        <Label htmlFor="hasPermission">Has Permission</Label>
      </div>

      <Button type="submit" disabled={isPending}>
        {permission ? "Update Permission" : "Assign Permission"}
      </Button>
      {permission && (
        <Button type="button" onClick={handleDelete} disabled={isPending}>
          Delete Permission
        </Button>
      )}
    </form>
  );
}
