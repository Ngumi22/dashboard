import React from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "./types";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onBlock: (userId: string) => void;
}

export default function UserTable({
  users,
  onEdit,
  onDelete,
  onBlock,
}: UserTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Roles</TableHead>
          <TableHead>Verified</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.user_id}>
            <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              {user.roles.map((role) => role.role_name).join(", ")}
            </TableCell>
            <TableCell>{user.is_verified ? "Yes" : "No"}</TableCell>
            <TableCell>
              <div className="space-x-2">
                <Button
                  onClick={() => onEdit(user)}
                  variant="outline"
                  size="sm">
                  Edit
                </Button>
                <Button
                  onClick={() => onDelete(user.user_id.toString())}
                  variant="destructive"
                  size="sm">
                  Delete
                </Button>
                <Button
                  onClick={() => onBlock(user.user_id.toString())}
                  variant="secondary"
                  size="sm">
                  {user.is_blocked ? "Unblock" : "Block"}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
