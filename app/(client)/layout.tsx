import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Loading from "./loading";

import { lazy, Suspense } from "react";
import ClientSideWrapper from "@/components/Client-Side/ClientWrapper";
import { ToastContainer } from "react-toastify";
import { initialize } from "@/lib/MysqlDB/initialize";

initialize();

const inter = Inter({
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
      <body className={inter.className} suppressHydrationWarning={true}>
        <ClientSideWrapper>
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </ClientSideWrapper>
        <ToastContainer position="bottom-left" />
      </body>
    </html>
  );
}
