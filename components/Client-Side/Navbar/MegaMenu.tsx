"use client";

import { useState } from "react";
import { ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const categories = [
  "Electronics",
  "Clothing",
  "Books",
  "Home & Garden",
  "Toys",
];

const storeCategories = {
  Electronics: ["Smartphones", "Laptops", "Accessories"],
  Clothing: ["Men", "Women", "Kids"],
  Books: ["Fiction", "Non-fiction", "Educational"],
};

const saleItems = [
  "Smartphone X - 30% off",
  "Laptop Y - 25% off",
  "Headphones Z - 40% off",
  "Smartwatch A - 35% off",
  "Camera B - 20% off",
];

const elements = ["About Us", "Contact Us", "Blog", "FAQ"];

export default function MegaMenu() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Mega Menu */}
      <section className="hidden bg-[#232F3E] md:grid grid-flow-col">
        <div className="justify-self-start relative group">
          <Button
            variant="ghost"
            className="group text-white gap-x-4 uppercase text-xs md:text-md rounded-none h-10">
            <Menu className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
            <span>Browse All Categories</span>
          </Button>
          <div className="absolute left-0 top-full w-[17rem] bg-white shadow-md overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
            {categories.map((category) => (
              <Button
                key={category}
                variant="ghost"
                className="w-full justify-start h-10">
                {category}
              </Button>
            ))}
          </div>
        </div>
        <Separator orientation="vertical" className="mx-2" />
        <div className="grid grid-flow-col justify-self-start md:gap-x-6">
          <Button
            variant="link"
            className="text-white uppercase text-xs md:text-md rounded-none h-10">
            <Link href={"/"}>Home</Link>
          </Button>
          <div
            className="relative"
            onMouseEnter={() => setActiveMenu("store")}
            onMouseLeave={() => setActiveMenu(null)}>
            <Button
              variant="ghost"
              className="text-white hover:text-black uppercase text-xs md:text-md rounded-none h-10"
              aria-expanded={activeMenu === "store"}
              aria-controls="store-menu">
              <span>Our Store</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            {activeMenu === "store" && (
              <div
                id="store-menu"
                className="absolute left-0 transform translate-y-2 w-40 bg-white shadow-md overflow-hidden z-50">
                {Object.entries(storeCategories).map(([category, items]) => (
                  <div key={category} className="group">
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-none h-10">
                      {category}
                    </Button>
                    <div className="absolute left-full top-0 w-48 bg-white shadow-md overflow-hidden invisible group-hover:visible">
                      {items.map((item) => (
                        <Button
                          key={item}
                          variant="ghost"
                          className="w-full justify-start h-10">
                          {item}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div
            className="relative"
            onMouseEnter={() => setActiveMenu("sale")}
            onMouseLeave={() => setActiveMenu(null)}>
            <Button
              variant="ghost"
              className="text-white hover:text-black uppercase text-xs md:text-md rounded-none h-10"
              aria-expanded={activeMenu === "sale"}
              aria-controls="sale-menu">
              Special Sale
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            {activeMenu === "sale" && (
              <div
                id="sale-menu"
                className="absolute left-0 transform translate-y-2 w-56 bg-white shadow-md overflow-hidden z-50">
                {saleItems.map((item) => (
                  <Button
                    key={item}
                    variant="ghost"
                    className="w-full justify-start rounded-none h-10">
                    {item}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <div
            className="relative mr-4"
            onMouseEnter={() => setActiveMenu("elements")}
            onMouseLeave={() => setActiveMenu(null)}>
            <Button
              variant="ghost"
              className="text-white hover:text-black uppercase text-xs md:text-md rounded-none h-10"
              aria-expanded={activeMenu === "elements"}
              aria-controls="elements-menu">
              <span>Browse pages</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            {activeMenu === "elements" && (
              <div
                id="elements-menu"
                className="absolute right-0 left-0 top-full w-36 bg-white shadow-md overflow-hidden z-50">
                {elements.map((item) => (
                  <Button
                    key={item}
                    variant="ghost"
                    className="w-full justify-start rounded-none h-10">
                    {item}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
