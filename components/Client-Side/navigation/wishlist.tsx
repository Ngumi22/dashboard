"use client";
import * as React from "react";
import Link from "next/link";

export default function WishList() {
  return (
    <Link
      href="/wishlist"
      className="grid grid-flow-col content-center place-content-start gap-2 m-auto py-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-star">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>

      <p className="text-sm">Wishlist</p>
    </Link>
  );
}
