"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { createRole, updateRole } from "@/lib/actions/Auth/roles/post";

interface Role {
  role_id?: number;
  role_name: string;
}

interface RoleFormProps {
  role?: Role;
}

export default function RoleForm({ role }: RoleFormProps) {
  const router = useRouter();
  const [roleName, setRoleName] = useState("");

  useEffect(() => {
    if (role) {
      setRoleName(role.role_name);
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (role?.role_id) {
        // Update existing role
        await updateRole(role.role_id, { role_name: roleName });
      } else {
        // Create new role
        await createRole({ role_name: roleName });
      }
      router.push("/dashboard/roles"); // Redirect to role list page
    } catch (error) {
      console.error("Error submitting role data:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="role_name">Role Name</Label>
        <Input
          id="role_name"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          required
        />
      </div>
      <Button type="submit">{role ? "Update Role" : "Create Role"}</Button>
    </form>
  );
}
