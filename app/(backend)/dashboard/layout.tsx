"use client";

import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/use-store";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import SideBar from "@/components/admin-panel/sideBar-nav";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/admin-panel/Navbar";
import { ThemeProvider } from "next-themes";
import { Roboto } from "next/font/google";
import "@/app/globals.css";
import { initialize } from "@/lib/main";

initialize;

const roboto = Roboto({
  subsets: ["latin"],
  weight: "400",
});

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Extracting the necessary state and actions from the sidebar store
  const isOpen = useStore(useSidebarToggle, (state) => state.isOpen);

  return (
    <html lang="en">
      <body className={roboto.className} suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <SideBar />
          <main
            className={cn(
              "min-h-[calc(100vh_-_56px)] bg-zinc-50 dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300 gap-4",
              isOpen === false ? "lg:ml-[90px]" : "lg:ml-72"
            )}>
            <Navbar title="Dashboard" />
            {children}
            <Toaster />
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
