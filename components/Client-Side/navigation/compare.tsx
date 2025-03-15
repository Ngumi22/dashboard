"use client";

import React, { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { useCompareStore } from "@/app/store/compare";
import Link from "next/link";

export default function Compare() {
  const [isClient, setIsClient] = useState(false);

  // Ensures this runs only on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const compareTotalQuantity = useCompareStore((state) =>
    state.getTotalQuantity()
  );

  return (
    <Link href={"/compare"} prefetch={true}>
      <div className="relative cursor-pointer flex items-center justify-center space-x-2 text-white">
        <RefreshCcw className="h-6 w-6" />
        <span className="absolute -top-2 -right-3 flex items-center justify-center font-bold text-center text-xs bg-white text-gray-900 h-5 w-5 rounded-full">
          {isClient ? compareTotalQuantity : 0}
        </span>
      </div>
    </Link>
  );
}
