"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useEffect, useRef, useCallback } from "react";
import MegaMenu from "./MegaMenu";

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
            <MegaMenu />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
