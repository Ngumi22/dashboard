"use client";

import { Heart, BarChart2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import dynamic from "next/dynamic";
import Logo from "../navigation/logo";
import SearchComponent from "../navigation/search";

const Cart = dynamic(() => import("../navigation/cart"), { ssr: false });

export default React.memo(function MainNav({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: any) {
  return (
    <nav className="bg-[#151C25] p-2 lg:p-4 space-y-2">
      {/* Top Row: Logo, Menu Button, and Icons */}
      <div className="mx-auto w-full flex items-center justify-between gap-2 sm:gap-4 lg:px-4">
        {/* Left Section: Menu Button and Logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu">
            <Menu className="h-5 w-5 text-white hover:text-black" />
          </Button>

          {/* Logo */}
          <div className="w-32 md:w-36 lg:w-48">
            <Logo />
          </div>
        </div>

        {/* Middle Section: Search Bar (Hidden on Mobile) */}
        <div className="hidden md:flex flex-1 max-w-[30rem] mx-2 lg:mx-4">
          <SearchComponent />
        </div>

        {/* Right Section: Icons and Cart */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Compare Button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            aria-label="Compare">
            <BarChart2 className="h-5 w-5 text-white hover:text-black" />
          </Button>

          {/* Favorites Button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            aria-label="Favorites">
            <Heart className="h-5 w-5 text-white hover:text-black" />
          </Button>

          {/* Cart */}
          <Cart />
        </div>
      </div>

      {/* Bottom Row: Search Bar (Visible on Mobile) */}
      <div className="md:hidden flex w-full max-w-[90vw] mx-auto relative">
        <SearchComponent />
      </div>
    </nav>
  );
});
