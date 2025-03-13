"use client";

import { Heart, BarChart2, Menu } from "lucide-react";
import React from "react";
import Logo from "../navigation/logo";
import SearchComponent from "../navigation/search";
import dynamic from "next/dynamic";
const Cart = dynamic(() => import("../navigation/cart"), { ssr: false });
const WishList = dynamic(() => import("../navigation/wishlist"), {
  ssr: false,
});

const Compare = dynamic(() => import("../navigation/compare"), {
  ssr: false,
});

interface MainNavProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function MainNav({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: MainNavProps) {
  return (
    <nav className="bg-[#151C25] py-2 lg:p-4 space-y-2">
      {/* Top Row: Logo, Menu Button, and Icons */}
      <div className="md:container flex items-center justify-between gap-4 md:px-4 pr-2">
        {/* Mobile Menu Button */}

        <Menu
          className="md:hidden h-8 w-8 text-white cursor-pointer"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        {/* Logo */}
        <div className="w-[8rem] md:w-[10rem] lg:w-[16rem]">
          <Logo />
        </div>

        {/* Middle Section: Search Bar (Hidden on Mobile) */}
        <div className="hidden md:flex flex-1">
          <SearchComponent />
        </div>

        {/* Right Section: Icons and Cart */}
        <div className="flex items-center gap-x-6">
          {/* Compare Button */}

          <WishList />

          {/* Favorites Button */}
          <Heart className="h-6 w-6 text-white cursor-pointer" />

          {/* Cart */}
          <Cart />
        </div>
      </div>

      {/* Bottom Row: Search Bar (Visible on Mobile) */}
      <div className="md:hidden flex flex-1 mx-2">
        <SearchComponent />
      </div>
    </nav>
  );
}
