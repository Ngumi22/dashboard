"use client";

import { Menu } from "lucide-react";
import React from "react";
import Logo from "../navigation/logo";
import WishList from "../navigation/wishlist";
import Compare from "../navigation/compare";
import Cart from "../navigation/cart";
import SearchInput from "../navigation/search-input";
import Customer from "../navigation/customer";

interface MainNavProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function MainNav({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: MainNavProps) {
  return (
    <nav className="py-2 lg:p-4 space-y-2 pr-2">
      <div className="md:container flex items-center justify-between gap-4 md:px-4 px-2">
        <Menu
          className="md:hidden h-8 w-8 cursor-pointer"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        <>
          <Logo />
        </>
        <div className="hidden md:flex flex-1">
          <SearchInput />
        </div>

        <div className="flex items-start justify-between gap-x-8">
          <Customer />

          <WishList />

          <Compare />

          <Cart />
        </div>
      </div>

      <div className="md:hidden flex flex-1 mx-2">
        <SearchInput />
      </div>
    </nav>
  );
}
