import Link from "next/link";
import { Facebook, Instagram, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-600 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Us Column */}
          <div>
            <h3 className="font-semibold text-lg mb-4">About Us</h3>
            <p className="text-sm">
              The exciting contemporary brand Suruchi is known for its attention
              to detail and premium graphics.
            </p>
            <div className="flex space-x-2">
              <Link href="#" className="hover:text-gray-800">
                <Facebook />
              </Link>
              <Link href="#" className="hover:text-gray-800">
                <Instagram />
              </Link>
              <Link href="#" className="hover:text-gray-800">
                TikTok
              </Link>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:text-gray-800">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-800">
                  Find store location
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-800">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-800">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-800">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:text-gray-800">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-800">
                  My account
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-800">
                  Product compare
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-800">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-800">
                  About us
                </Link>
              </li>
            </ul>
          </div>
          {/* Newsletter Section */}
          <div className="">
            <h3 className="font-semibold text-lg mb-4">Newsletter</h3>
            <p className="mb-4">
              Write your email first to know about any information
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-grow"
              />
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 text-center text-sm">
          © {new Date().getFullYear()} Bernzz Digital Solutions. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
