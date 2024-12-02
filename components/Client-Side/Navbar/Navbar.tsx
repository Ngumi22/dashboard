"use client";

import { useState, useEffect } from "react";
import MainNav from "./MainNav";
import MegaMenu from "./MegaMenu";
import MobileMenu from "./MobileMenu";
import TopNav from "./TopNav";
import { Separator } from "@/components/ui/separator";

export default function NewNavbar() {
  const [showFullNav, setShowFullNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        setShowFullNav(false);
      } else {
        setShowFullNav(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md transition-all duration-300 ease-in-out">
      <div
        className={`transition-all duration-300 ease-in-out ${
          showFullNav ? "max-h-screen" : "max-h-0 overflow-hidden"
        }`}>
        <TopNav />
      </div>
      <Separator />
      <MainNav
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <div
        className={`transition-all duration-300 ease-in-out ${
          showFullNav ? "max-h-screen" : "max-h-0 overflow-hidden"
        }`}>
        <MegaMenu />
      </div>
      <MobileMenu isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
    </nav>
  );
}
