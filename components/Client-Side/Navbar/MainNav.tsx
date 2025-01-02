"use client";

import { Search, Heart, ShoppingCart, BarChart2, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import Logo from "../navigation/logo";
import Cart from "../navigation/cart";

export default function MainNav({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: any) {
  return (
    <div className="bg-[#151C25] py-6 px-4 space-y-4">
      <div className="mx-auto w-full flex items-center justify-between md:px-12">
        <div className="mr-2 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="h-8 w-8 text-white hover:text-black" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
        <div className="grid grid-flow-col justify-self-start">
          <div className="w-32 sm:w-36 md:w-48 m-auto">
            <Logo />
          </div>
        </div>
        <div className="hidden relative md:flex w-full max-w-sm sm:max-w-md rounded-r">
          <Input
            type="search"
            placeholder="Search products..."
            className="w-full "
          />
          <Button size="sm" className="absolute my-auto right-1 bottom-0 top-0">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2 lg:space-x-8">
          <Button variant="ghost" size="sm" className="sm:flex">
            <BarChart2 className="h-8 w-8 text-white hover:text-black" />
            <span className="sr-only">Compare</span>
          </Button>
          <Button variant="ghost" size="sm" className="sm:flex">
            <Heart className="h-8 w-8 text-white hover:text-black" />
            <span className="sr-only">Favorites</span>
          </Button>
          <Cart />
        </div>
      </div>
      <div className="md:hidden flex w-full max-w-xl mx-auto relative">
        <Input
          type="search"
          placeholder="Search products..."
          className="w-full "
        />
        <Button size="sm" className="absolute my-auto right-1 bottom-0 top-0">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
    </div>
  );
}
