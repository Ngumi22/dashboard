"use client";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { PermissionForm } from "../Forms/PermissionForm";

// Define the User type
export interface User {
  user_id: number;
  name: string;
}

type Props = {
  users: User[];
  entities: Entity[];
  actions: Action[];
};

type Entity = {
  entity_id: string;
  entity_name: string;
};

type Action = {
  action_id: string;
  action_name: string;
};

export default function AddPermissionDialog({
  users,
  entities,
  actions,
}: Props) {
  const [isOpen, setIsOpen] = useState(false); // To manage dialog state

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
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
  );
}
