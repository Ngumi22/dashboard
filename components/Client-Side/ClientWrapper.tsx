"use client";

import { useState, useEffect } from "react";
import Loading from "@/app/(client)/loading";
import NewNavbar from "./Navbar/Navbar";

export default function ClientSideWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <Loading />;

  return (
    <>
      <NewNavbar />
      {children}
    </>
  );
}
