import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href={"/"} prefetch={true} className="flex items-center h-16">
      <Image
        src="/logo.svg"
        alt="Bernzz Logo"
        width={100} // Match w-36 (Tailwind's width)
        height={100}
        className="w-[8rem] md:w-[10rem] lg:w-[12rem]" // Ensure responsive sizing
        priority // Ensures preloading for LCP improvement
      />
    </Link>
  );
}
