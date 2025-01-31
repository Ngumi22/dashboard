"use client";

import { Heart, BarChart2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import Logo from "../navigation/logo";
import SearchComponent from "../navigation/search";
import Cart from "../navigation/cart";

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
      <div className="container flex items-center justify-between gap-4 lg:px-4">
        {/* Left Section: Menu Button and Logo */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden"
            aria-label="Toggle menu">
            <Menu className="h-5 w-5 text-white hover:text-neutral-900" />
          </Button>

          {/* Logo */}
          <div className="w-32 md:w-36 lg:w-48">
            <Logo />
          </div>
        </div>

        {/* Middle Section: Search Bar (Hidden on Mobile) */}
        <div className="hidden md:flex flex-1 mx-2">
          <SearchComponent />
        </div>

        {/* Right Section: Icons and Cart */}
        <div className="flex items-center gap-4">
          {/* Compare Button */}
          <Button variant="ghost" size="sm" aria-label="Compare">
            <BarChart2 className="h-5 w-5 text-white hover:text-neutral-900" />
          </Button>

          {/* Favorites Button */}
          <Button variant="ghost" size="sm" aria-label="Favorites">
            <Heart className="h-5 w-5 text-white hover:text-neutral-900" />
          </Button>

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
