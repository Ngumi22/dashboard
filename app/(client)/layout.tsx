import type { Metadata } from "next";

import "../globals.css";
import Loading from "./loading";

import { lazy, Suspense } from "react";
import ClientSideWrapper from "@/components/Client-Side/ClientWrapper";
import { ToastContainer } from "react-toastify";
import { Inter } from "next/font/google";
import NewNavbar from "@/components/Client-Side/Navbar/Navbar";

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <ClientSideWrapper>
          <Suspense fallback={<Loading />}>
            <NewNavbar />
            {children}
          </Suspense>
        </ClientSideWrapper>
        <ToastContainer position="bottom-left" />
      </body>
    </html>
  );
}
