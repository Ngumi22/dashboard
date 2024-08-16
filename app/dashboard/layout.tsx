"use client";
import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/use-store";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import SideBar from "@/components/admin-panel/sideBar-nav";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/admin-panel/Navbar";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebar = useStore(useSidebarToggle, (state) => state);

  if (!sidebar) return null;

  return (
    <>
      <SideBar />
      <main
        className={cn(
          "min-h-[calc(100vh_-_56px)] bg-zinc-50 dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300 gap-4",
          sidebar?.isOpen === false ? "lg:ml-[90px]" : "lg:ml-72"
        )}>
        <Navbar title="Dashboard" />
        {children}
        <Toaster />
      </main>
    </>
  );
}
