"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useRef, useCallback } from "react";

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

export default function MobileMenu({ isOpen, setIsOpen }: any) {
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => setIsOpen(false), [setIsOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}>
      <div
        ref={menuRef}
        className={`absolute top-0 left-0 bottom-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Menu</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-2">
            <X className="h-6 w-6" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-64px)]">
          <div className="p-4 space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="categories">
                <AccordionTrigger>All Categories</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {categories.map((category) => (
                      <li key={category}>
                        <a
                          href="#"
                          className="text-sm text-gray-600 hover:text-gray-800">
                          {category}
                        </a>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="home">
                <AccordionTrigger>Home</AccordionTrigger>
                <AccordionContent>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-800">
                    Go to Homepage
                  </a>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="store">
                <AccordionTrigger>Our Store</AccordionTrigger>
                <AccordionContent>
                  <Accordion type="single" collapsible className="w-full">
                    {Object.entries(storeCategories).map(
                      ([category, items]) => (
                        <AccordionItem value={category} key={category}>
                          <AccordionTrigger>{category}</AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2">
                              {items.map((item) => (
                                <li key={item}>
                                  <a
                                    href="#"
                                    className="text-sm text-gray-600 hover:text-gray-800">
                                    {item}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      )
                    )}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="sale">
                <AccordionTrigger>Special Sale</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {saleItems.map((item) => (
                      <li key={item}>
                        <a
                          href="#"
                          className="text-sm text-gray-600 hover:text-gray-800">
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="elements">
                <AccordionTrigger>Elements</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="#"
                        className="text-sm text-gray-600 hover:text-gray-800">
                        About Us
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-sm text-gray-600 hover:text-gray-800">
                        Contact Us
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-sm text-gray-600 hover:text-gray-800">
                        Blog
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-sm text-gray-600 hover:text-gray-800">
                        FAQ
                      </a>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
