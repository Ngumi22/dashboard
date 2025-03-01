import type { Metadata } from "next";
import "../globals.css";
import Loading from "./loading";
import { Suspense } from "react";
import ClientSideWrapper from "@/components/Client-Side/ClientWrapper";
import { ToastContainer } from "react-toastify";
import { initialize } from "@/lib/MysqlDB/initialize";
import NewNavbar from "@/components/Client-Side/Navbar/Navbar";
import Footer from "@/components/Client-Side/Footer/footer";
import { prefetchData } from "@/lib/actions/serverSideFetching";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bernzzdigitalsolutions.co.ke"),
  title: {
    default: "Bernzz Digital Solutions - Premium Tech Products",
    template: "%s | Bernzz Digital Solutions",
  },
  description:
    "Shop the latest electronics, gadgets, and tech accessories at Bernzz Digital Solutions. Find premium products at competitive prices with fast shipping.",
  keywords: [
    "electronics",
    "tech",
    "gadgets",
    "smartphones",
    "laptops",
    "audio",
    "smart home",
  ],
  authors: [{ name: "Bernzz Digital Solutions" }],
  creator: "Bernzz Digital Solutions",
  publisher: "Bernzz Digital Solutions.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.bernzzdigitalsolutions.co.ke",
    siteName: "Bernzz Digital Solutions",
    title: "Bernzz Digital Solutions - Premium Tech Products",
    description:
      "Shop the latest electronics, gadgets, and tech accessories at Bernzz Digital Solutions.",
    images: [
      {
        url: "https://www.bernzzdigitalsolutions.co.ke/og-image.jpg", // This would be a real image in production
        width: 1200,
        height: 630,
        alt: "Bernzz Digital Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bernzz Digital Solutions",
    description:
      "Shop the latest electronics, gadgets, and tech accessories at Bernzz Digital Solutions.",
    images: ["https://www.bernzzdigitalsolutions.co.ke/twitter-image.jpg"], // This would be a real image in production
    creator: "Bernzz Digital Solutions",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "https://www.bernzzdigitalsolutions.co.ke/site.webmanifest",
  alternates: {
    canonical: "https://www.bernzzdigitalsolutions.co.ke",
    languages: {
      "en-US": "https://www.bernzzdigitalsolutions.co.ke",
    },
  },
  verification: {
    google: "google-site-verification-code", // Replace with actual verification code
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Initialize your database (if needed)
  await initialize();

  prefetchData();

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <ClientSideWrapper>
          <NewNavbar />
          {children}
          <Footer />
        </ClientSideWrapper>
        <ToastContainer position="bottom-left" />
      </body>
    </html>
  );
}
