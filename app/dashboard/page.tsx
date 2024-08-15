"use client";
import Link from "next/link";
import { PanelsTopLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/admin-panel/menu";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import { SidebarToggle } from "@/components/admin-panel/sidebar-toggle";
import OrdersCard from "@/components/reports/Orders";

export default function Dashboard() {
  // Directly use useSidebarToggle hook
  const { isOpen, setIsOpen } = useSidebarToggle();

  return (
    <section className="flex flex-row gap-3">
      <aside
        className={cn(
          "-translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
          isOpen === false ? "w-[90px]" : "w-72"
        )}>
        <SidebarToggle isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800">
          <Button
            className={cn(
              "transition-transform ease-in-out duration-300 mb-1",
              isOpen === false ? "translate-x-1" : "translate-x-0"
            )}
            variant="link"
            asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              <PanelsTopLeft className="w-6 h-6 mr-1" />
              <h1
                className={cn(
                  "font-bold text-lg whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300",
                  isOpen === false
                    ? "-translate-x-96 opacity-0 hidden"
                    : "translate-x-0 opacity-100"
                )}>
                Brand
              </h1>
            </Link>
          </Button>
          <Menu isOpen={isOpen} />
        </div>
      </aside>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-4">
        <OrdersCard />
        <OrdersCard />
        <OrdersCard />
        <OrdersCard />
      </div>
    </section>
  );
}
