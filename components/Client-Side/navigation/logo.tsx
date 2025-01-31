import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src="/logo.png"
      alt="Bernzz Logo"
      width={144} // Match w-36 (Tailwind's width)
      height={144}
      className="w-32 md:w-36 lg:w-48" // Ensure responsive sizing
      priority // Ensures preloading for LCP improvement
      quality={75} // Higher quality but optimized
      sizes="(max-width: 768px) 128px, (max-width: 1024px) 144px, 192px"
    />
  );
}
