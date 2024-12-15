import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "../globals.css";
import Loading from "./loading";

import { lazy, Suspense } from "react";
import ClientSideWrapper from "@/components/Client-Side/ClientWrapper";

const roboto = Roboto({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font" suppressHydrationWarning={true}>
        <ClientSideWrapper>
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </ClientSideWrapper>
      </body>
    </html>
  );
}
