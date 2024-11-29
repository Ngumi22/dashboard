"use client";

import Link from "next/link";
import { Menu, Package2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Logo from "./logo";
import { ModeToggle } from "@/components/mode-toggle";

export default function Navbar() {
  return (
    <section className="sticky top-0 z-50">
      <header className="bg-[#1c2634] grid grid-flow-row md:h-32 py-2 md:grid-flow-col">
        <Logo />
        <Logo />
        <form className="flex justify-center items-center rounded border m-auto">
          <Select>
            <SelectTrigger className="w-48 rounded-none">
              <SelectValue placeholder="Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Input
            type="text"
            placeholder="Search..."
            className="px-2 bottom-2 border-none rounded-none h-10"
          />
          <button
            type="submit"
            className="bg-[#feda00] h-10 text-sm text-black px-8 rounded-r-sm">
            Search
          </button>
        </form>
        <div className="grid grid-flow-col md:place-content-center place-content-between content-center my-auto">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden text-white">
                  <Menu className="h-8 w-8" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium">
                  <Link
                    href="#"
                    className="flex items-center gap-2 text-lg font-semibold">
                    <Package2 className="h-6 w-6" />
                    <span className="sr-only">Acme Inc</span>
                  </Link>
                  <Link href="#" className="hover:text-foreground">
                    Dashboard
                  </Link>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground">
                    Orders
                  </Link>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground">
                    Products
                  </Link>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground">
                    Customers
                  </Link>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground">
                    Analytics
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <div className="grid grid-flow-col content-center place-content-center">
            <div className="hidden lg:flex items-center space-x-2 rounded-none">
              <div className="border-2 border-[#feda00] rounded-full p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-phone-call stroke-[#feda00]">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  <path d="M14.05 2a9 9 0 0 1 8 7.94" />
                  <path d="M14.05 6A5 5 0 0 1 18 10" />
                </svg>
              </div>
              <div className="text-white text-start text-sm">
                <p>Contact Us</p>
                <p>0713000000</p>
              </div>
            </div>
            <p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="fill-blue-500"
                className="bi bi-arrow-left fill-blue-500"
                viewBox="0 0 16 16">
                <path
                  fillRule="evenodd"
                  d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
                />
              </svg>
            </p>
          </div>
        </div>
        <ModeToggle />
      </header>
    </section>
  );
}
