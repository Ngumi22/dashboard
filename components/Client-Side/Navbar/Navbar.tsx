"use client";

import { useState, useEffect } from "react";
import MainNav from "./MainNav";
import MegaMenu from "./MegaMenu";
import MobileMenu from "./MobileMenu";
import TopNav from "./TopNav";
import { Separator } from "@/components/ui/separator";
import { navigation } from "./navigation";

export default function NewNavbar() {
  const [showFullNav, setShowFullNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY ? "down" : "up";

      // Always show navbar when scrolling up
      if (scrollDirection === "up") {
        setShowFullNav(true);
      } else {
        // Only hide when scrolling down past threshold
        if (currentScrollY > 100) {
          setShowFullNav(false);
        }
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div
        className={`transition-all duration-50 overflow-hidden ${
          showFullNav ? "opacity-100 max-h-[500px]" : "opacity-0 max-h-0"
        }`}>
        <TopNav />
      </div>
      <Separator />
      <MainNav
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <div
        className={`transition-all duration-50 w-full overflow-hidden ${
          showFullNav ? "opacity-100 max-h-[500px]" : "opacity-0 max-h-0"
        }`}>
        <MegaMenu navigation={navigation} />
      </div>
      <MobileMenu isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
    </nav>
  );
}
