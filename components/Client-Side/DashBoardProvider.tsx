"use client";

import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/use-store";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import { Navbar } from "@/components/admin-panel/Navbar";

import { QueryClientProvider, HydrationBoundary } from "@tanstack/react-query";
import { useState } from "react";
import { DehydratedState } from "@tanstack/react-query";
import { getQueryClient } from "./get-query-client";

export default function DashBoardProvider({
  children,
  dehydratedState,
}: {
  children: React.ReactNode;
  dehydratedState?: DehydratedState;
}) {
  const isOpen = useStore(useSidebarToggle, (state) => state.isOpen);
  const [queryClient] = useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <main
          className={cn(
            "min-h-[calc(100vh_-_56px)] bg-zinc-50 dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300 gap-4",
            isOpen === false ? "lg:ml-[90px]" : "lg:ml-72"
          )}>
          <Navbar title="Dashboard" />
          {children}
        </main>
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
