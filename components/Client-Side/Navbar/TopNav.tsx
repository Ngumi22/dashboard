"use client";

import { useState } from "react";
import { Globe, ChevronDown, Phone, MessageCircleHeart } from "lucide-react";
import { Button } from "@/components/ui/button";

const currencies = ["KSh", "USD", "EUR"];
const languages = ["English", "Français", "Español"];
const accountOptions = ["Create Account", "Login", "Logout"];

export default function TopNav() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <div className="bg-[#151C25] py-2 grid grid-flow-col gap-x-4 place-items-center px-2">
      <p className="text-white text-center text-xs md:text-xs lg:text-base sm:text-left justify-self-start md:pl-4">
        Free Delivery Over $1000
      </p>
      <div className="grid grid-flow-col gap-x-4 place-items-center justify-self-end md:pr-4">
        <a
          href="tel:+1234567890"
          className="text-white hover:text-gray-800 flex items-center px-2 gap-x-2">
          <Phone className="h-4 w-4" fill="blue" />
          <span className="hidden sm:inline text-xs lg:text-base hover:text-white">
            +254 720 000-000
          </span>
        </a>
        <a
          href="tel:+1234567890"
          className="text-white hover:text-gray-800 flex items-center px-2 gap-x-2">
          <MessageCircleHeart className="h-4 w-4 text-white" fill="green" />
          <span className="hidden sm:inline text-xs lg:text-base text-white">
            WhatsApp
          </span>
        </a>
        <div
          className="relative"
          onMouseEnter={() => setActiveMenu("currency")}
          onMouseLeave={() => setActiveMenu(null)}>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs lg:text-base px-2 text-white flex items-center rounded-none">
            <span>Currency</span>
            <ChevronDown className="ml-1 h-4 w-4 my-auto" />
          </Button>
          {activeMenu === "currency" && (
            <div className="absolute right-0  w-24 bg-white border border-gray-200 shadow-lg z-10">
              {currencies.map((currency) => (
                <Button
                  key={currency}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs lg:text-sm rounded-none">
                  {currency}
                </Button>
              ))}
            </div>
          )}
        </div>
        <div
          className="relative"
          onMouseEnter={() => setActiveMenu("language")}
          onMouseLeave={() => setActiveMenu(null)}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-none">
            <Globe className="h-4 w-4 text-white hover:text-black" />
            <span className="sr-only">Language</span>
          </Button>
          {activeMenu === "language" && (
            <div className="absolute right-0  w-28 bg-white border border-gray-200 shadow-lg z-10">
              {languages.map((language) => (
                <Button
                  key={language}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs lg:text-sm">
                  {language}
                </Button>
              ))}
            </div>
          )}
        </div>
        <div
          className="relative"
          onMouseEnter={() => setActiveMenu("account")}
          onMouseLeave={() => setActiveMenu(null)}>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs lg:text-base px-2 text-white rounded-none">
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
                  className="w-full justify-start text-xs lg:text-sm rounded-none">
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
