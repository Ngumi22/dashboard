"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircleUser, Menu, Package2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { logout } from "@/lib/actions"; // Ensure this path is correct

export default function DashboardHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally handle logout errors (e.g., show a notification)
    }
  };
  return (
    <div className="flex w-full flex-col">
      <header className="sticky top-0 flex h-24 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 md:flex md:flex-row md:items-center justify-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-md font-semibold md:text-base">
            <span>Bernzz</span>
            <span className="sr-only">Bernzz</span>
          </Link>

          <Link
            href="/dashboard/products"
            className="text-foreground transition-colors hover:text-foreground text-md">
            Products
          </Link>
          <Link
            href="/dashboard/categories"
            className="text-foreground transition-colors hover:text-foreground text-md">
            Categories
          </Link>
          <Link
            href="/dashboard/customers"
            className="text-foreground transition-colors hover:text-foreground text-md">
            Customers
          </Link>
          <Link
            href="/dashboard/invoices"
            className="text-foreground transition-colors hover:text-foreground text-md">
            Invoices
          </Link>
          <Link
            href="/dashboard/orders"
            className="text-foreground transition-colors hover:text-foreground text-md">
            Orders
          </Link>
          <Link
            href="/dashboard/blog"
            className="text-foreground transition-colors hover:text-foreground text-md">
            Blog
          </Link>
          <Link
            href="/dashboard/settings"
            className="text-foreground transition-colors hover:text-foreground text-md">
            Settings
          </Link>
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-xl font-medium">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-md font-semibold">
                <Package2 className="h-6 w-6" />
                <span className="sr-only">Acme Inc</span>
              </Link>

              <Link
                href="/dashboard/products"
                className="text-muted-foreground hover:text-foreground">
                Products
              </Link>
              <Link
                href="/dashboard/categories"
                className="text-muted-foreground hover:text-foreground">
                Categories
              </Link>
              <Link
                href="/dashboard/customers"
                className="text-muted-foreground hover:text-foreground">
                Customers
              </Link>
              <Link
                href="/dashboard/invoices"
                className="hover:text-foreground">
                Invoices
              </Link>
              <Link href="/dashboard/orders" className="hover:text-foreground">
                Orders
              </Link>
              <Link href="/dashboard/blog" className="hover:text-foreground">
                Blog
              </Link>
              <Link
                href="/dashboard/settings"
                className="hover:text-foreground">
                Settings
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <form className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </div>
          </form>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={"/dashboard/settings"}>Settings</Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </div>
  );
}
