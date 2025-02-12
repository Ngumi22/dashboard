import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Plus, Trash } from "lucide-react";
import { RowAction } from "./types";
import clsx from "clsx";

interface TableRowActionsProps<T> {
  item: T;
  actions: RowAction<T>[];
}

export default function TableRowActions<T>({
  item,
  actions,
}: TableRowActionsProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => action.onClick(item)}
            className={clsx(
              "flex items-center cursor-pointer p-2 rounded-md transition-all",
              action.label === "Delete"
                ? "text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
                : action.label === "Edit"
                ? "text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900"
                : action.label === "View"
                ? "text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900"
                : action.label === "Variant"
                ? "text-green-500 hover:bg-green-100 dark:hover:bg-green-900"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            )}>
            <action.icon className="mr-2 h-4 w-4" />
            <span>{action.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
