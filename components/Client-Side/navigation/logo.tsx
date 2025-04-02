import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href={"/"} prefetch={true} className="h-14 w-auto">
      <Image
        src="/logo.png"
        alt="Bernzz Logo"
        width={144} // Match w-36 (Tailwind's width)
        height={144}
        className="h-auto w-auto" // Ensure responsive sizing
        priority // Ensures preloading for LCP improvement
        sizes="(max-width: 768px) 128px, (max-width: 1024px) 144px, 192px"
      />
    </Link>
  );
}
