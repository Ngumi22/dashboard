"use client";

import { User } from "lucide-react";
import Link from "next/link";

export default function Customer() {
  return (
    <Link href={"/account"} prefetch={true}>
      <div className="relative cursor-pointer flex items-center justify-center space-x-2">
        <User className="h-6 w-6" />
      </div>
    </Link>
  );
}
