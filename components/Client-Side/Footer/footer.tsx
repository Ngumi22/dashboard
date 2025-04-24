"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "../navigation/logo";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function Footer() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Set initial expanded state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setExpandedSection(null); // On larger screens, no sections are expanded by default
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="mx-auto max-w-screen-xl px-4 pt-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-12">
          {/* Company Info Section */}
          <div className="lg:col-span-4 md:px-4">
            <div className="flex justify-center lg:justify-start">
              <Logo />
            </div>

            <p className="mt-4 text-center text-gray-600 dark:text-gray-400 md:text-left max-w-md mx-auto md:mx-0">
              We are the leading and most trusted sellers of Laptops, Desktops,
              Computers, Phones and Tablets, Accessories and Computing solutions
              in Kenya.
            </p>

            {/* Newsletter Signup */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-center lg:text-left">
                Subscribe to our newsletter
              </h3>
              <div className="mt-3 flex flex-col sm:flex-row gap-2 max-w-md mx-auto md:mx-0">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-md border-gray-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                />
                <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-primary dark:hover:bg-primary/90">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="mt-6">
              <ul className="flex justify-center gap-6 md:justify-start">
                <li>
                  <a
                    href="https://facebook.com"
                    rel="noreferrer"
                    target="_blank"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-primary hover:text-white hover:border-primary transition-colors dark:border-gray-700 dark:text-gray-400 dark:hover:border-primary">
                    <span className="sr-only">Facebook</span>
                    <Facebook className="h-4 w-4" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://instagram.com"
                    rel="noreferrer"
                    target="_blank"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-primary hover:text-white hover:border-primary transition-colors dark:border-gray-700 dark:text-gray-400 dark:hover:border-primary">
                    <span className="sr-only">Instagram</span>
                    <Instagram className="h-4 w-4" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com"
                    rel="noreferrer"
                    target="_blank"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-primary hover:text-white hover:border-primary transition-colors dark:border-gray-700 dark:text-gray-400 dark:hover:border-primary">
                    <span className="sr-only">Twitter</span>
                    <Twitter className="h-4 w-4" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Links Section */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* About Us Section */}
              <div>
                <div
                  className="flex items-center justify-between mb-4 lg:mb-6 cursor-pointer"
                  onClick={() => toggleSection("about")}>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    About Us
                  </p>
                  <button className="lg:hidden">
                    {expandedSection === "about" ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>

                <ul
                  className={`space-y-3 transition-all duration-200 ${expandedSection === "about" ? "block" : expandedSection === null ? "hidden md:block" : "hidden md:block"}`}>
                  <li>
                    <Link
                      className="text-gray-600 transition hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                      href="/about/history">
                      Company History
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-gray-600 transition hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                      href="/about/team">
                      Meet the Team
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-gray-600 transition hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                      href="/about/handbook">
                      Employee Handbook
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-gray-600 transition hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                      href="/careers">
                      Careers
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Our Products Section */}
              <div>
                <div
                  className="flex items-center justify-between mb-4 lg:mb-6 cursor-pointer"
                  onClick={() => toggleSection("products")}>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    Our Products
                  </p>
                  <button className="lg:hidden">
                    {expandedSection === "products" ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>

                <ul
                  className={`space-y-3 transition-all duration-200 ${expandedSection === "products" ? "block" : expandedSection === null ? "hidden md:block" : "hidden md:block"}`}>
                  <li>
                    <Link
                      className="text-gray-600 transition hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                      href="/products/laptops">
                      Laptops
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-gray-600 transition hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                      href="/products/phones-tablets">
                      Phones and Tablets
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-gray-600 transition hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                      href="/products/desktops">
                      Desktops and Computers
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-gray-600 transition hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                      href="/products/smartphones">
                      Smartphones
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Helpful Links Section */}
              <div>
                <div
                  className="flex items-center justify-between mb-4 lg:mb-6 cursor-pointer"
                  onClick={() => toggleSection("helpful")}>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    Helpful Links
                  </p>
                  <button className="lg:hidden">
                    {expandedSection === "helpful" ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>

                <ul
                  className={`space-y-3 transition-all duration-200 ${expandedSection === "helpful" ? "block" : expandedSection === null ? "hidden md:block" : "hidden md:block"}`}>
                  <li>
                    <Link
                      className="text-gray-600 transition hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                      href="/faqs">
                      FAQs
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-gray-600 transition hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                      href="/support">
                      Support
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-gray-600 transition hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                      href="/shipping-policy">
                      Shipping Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-gray-600 transition hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                      href="/return-policy">
                      Return Policy
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact Us Section */}
              <div>
                <div
                  className="flex items-center justify-between mb-4 lg:mb-6 cursor-pointer"
                  onClick={() => toggleSection("contact")}>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    Contact Us
                  </p>
                  <button className="lg:hidden">
                    {expandedSection === "contact" ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>

                <ul
                  className={`space-y-3 transition-all duration-200 ${expandedSection === "contact" ? "block" : expandedSection === null ? "hidden md:block" : "hidden md:block"}`}>
                  <li>
                    <a
                      className="flex items-start gap-2 text-gray-600 transition hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                      href="mailto:bernzzdigitalsolutions@gmail.com">
                      <Mail className="h-5 w-5 shrink-0 text-gray-900 dark:text-gray-300" />
                      <span className="text-sm break-all">
                        bernzzdigitalsolutions@gmail.com
                      </span>
                    </a>
                  </li>
                  <li>
                    <a
                      className="flex items-start gap-2 text-gray-600 transition hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                      href="tel:+254112725364">
                      <Phone className="h-5 w-5 shrink-0 text-gray-900 dark:text-gray-300" />
                      <span className="text-sm">+254 112725364</span>
                    </a>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="h-5 w-5 shrink-0 text-gray-900 dark:text-gray-300" />
                    <address className="not-italic text-sm">
                      Revlon Plaza, Nairobi, Kenya
                    </address>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-10 md:mt-12 border-t border-gray-200 dark:border-gray-800 pt-6 md:pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 sm:justify-start text-center sm:text-left">
              <Link
                className="text-sm text-gray-600 transition hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                href="/terms">
                Terms & Conditions
              </Link>
              <span className="hidden sm:block text-gray-500 dark:text-gray-500">
                •
              </span>
              <Link
                className="text-sm text-gray-600 transition hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                href="/privacy">
                Privacy Policy
              </Link>
              <span className="hidden sm:block text-gray-500 dark:text-gray-500">
                •
              </span>
              <Link
                className="text-sm text-gray-600 transition hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                href="/cookies">
                Cookie Policy
              </Link>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2025 BDS. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
