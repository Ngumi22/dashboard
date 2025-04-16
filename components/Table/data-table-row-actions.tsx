"use client";

import type React from "react";

import type { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: any) => void;
  className?: string;
}

interface ActionGroup {
  label?: string;
  items: ActionItem[];
}

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  actions: ActionGroup[];
}

export function DataTableRowActions<TData>({
  row,
  actions,
}: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((group, groupIndex) => (
          <div key={groupIndex}>
            {group.label && (
              <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
            )}
            {group.items.map((action, actionIndex) => (
              <DropdownMenuItem
                key={actionIndex}
                onClick={() => action.onClick(row.original)}
                className={action.className}>
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </DropdownMenuItem>
            ))}
            {groupIndex < actions.length - 1 && <DropdownMenuSeparator />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
