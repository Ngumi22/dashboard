"use client";

import { useState } from "react";
import { Phone, MessageCircleHeart, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const accountOptions = ["Create Account", "Login", "Logout"];

export default function TopNav() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <div className="bg-[#151C25] flex items-center justify-between px-2 sm:px-4 py-1">
      {/* Left Section: Delivery Text */}
      <p className="text-white text-xs md:text-sm whitespace-nowrap truncate">
        Free Delivery Over Ksh 80,000
      </p>

      {/* Right Section: Contact Links and Account Dropdown */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Phone Link */}
        <a
          href="tel:+254 112 725 364"
          className="text-white hover:text-gray-300 flex items-center gap-1 sm:gap-2 px-2">
          <Phone className="h-4 w-4" />
          <span className="hidden sm:inline text-xs md:text-sm whitespace-nowrap">
            +254 (0) 112 725 364
          </span>
        </a>

        {/* WhatsApp Link */}
        <a
          href="https://wa.me/+254 112 725 364"
          className="text-white hover:text-gray-300 flex items-center gap-1 sm:gap-2 px-2">
          <MessageCircleHeart className="h-4 w-4" />
          <span className="hidden sm:inline text-xs md:text-sm whitespace-nowrap">
            WhatsApp
          </span>
        </a>

        {/* Account Dropdown */}
        <div
          className="relative"
          onMouseEnter={() => setActiveMenu("account")}
          onMouseLeave={() => setActiveMenu(null)}>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs md:text-sm px-2 text-white hover:bg-gray-800 rounded-none">
            Account
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
          {activeMenu === "account" && (
            <div className="absolute right-0 w-32 bg-white border border-gray-200 shadow-lg z-10">
              {accountOptions.map((option) => (
                <Button
                  key={option}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs md:text-sm rounded-none hover:bg-gray-100">
                  {option}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
