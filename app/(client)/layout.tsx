import type { Metadata } from "next";
import "../globals.css";
import Loading from "./loading";
import { Suspense } from "react";
import ClientSideWrapper from "@/components/Client-Side/ClientWrapper";
import { ToastContainer } from "react-toastify";
import { initialize } from "@/lib/MysqlDB/initialize";
import NewNavbar from "@/components/Client-Side/Navbar/Navbar";
import Footer from "@/components/Client-Side/Footer/footer";

export const metadata: Metadata = {
  title: "Bernzz Digital Solutions",
  description: "Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  initialize();
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <ClientSideWrapper>
          <Suspense fallback={<Loading />}>
            <NewNavbar />
            {children}
            <Footer />
          </Suspense>
        </ClientSideWrapper>
        <ToastContainer position="bottom-left" />
      </body>
    </html>
  );
}
