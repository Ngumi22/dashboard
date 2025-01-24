"use client";

import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src="/logo.webp" // Use WebP format
      alt="Bernzz Logo"
      width={230}
      height={230}
      className="object-contain m-auto h-auto w-auto"
      priority // Preload the image
      quality={60} // Adjust quality
      loading="eager" // Load immediately
    />
  );
}
