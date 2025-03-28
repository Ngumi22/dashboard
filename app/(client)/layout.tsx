import type { Metadata } from "next";
import "../globals.css";
import ClientSideWrapper from "@/components/Client-Side/ClientWrapper";
import { ToastContainer } from "react-toastify";
import { initialize } from "@/lib/MysqlDB/initialize";
import { prefetchData } from "@/lib/actions/serverSideFetching";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bernzzdigitalsolutions.co.ke"),
  title: {
    default: "Bernzz Digital Solutions - Affordable Tech Products",
    template: "%s | Bernzz Digital Solutions",
  },
  description:
    "Shop the latest electronics, laptops, smartphones and accessories at Bernzz Digital Solutions. Find quality products at the most affordable prices.",
  keywords: [
    "laptops",
    "electronics",
    "computers",
    "gaming",
    "smartphones",
    "accessories",
    "computing",
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
    title: "Bernzz Digital Solutions - Affordable Tech Products",
    description:
      "Shop the latest laptops, electronics, smartphones and accessories at Bernzz Digital Solutions",
    images: [
      {
        url: "https://www.bernzzdigitalsolutions.co.ke/opengraph-image.png", // This would be a real image in production
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
    images: ["https://www.bernzzdigitalsolutions.co.ke/opengraph-image.png"], // This would be a real image in production
    creator: "Bernzz Digital Solutions",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
  },
  alternates: {
    canonical: "https://www.bernzzdigitalsolutions.co.ke",
    languages: {
      "en-US": "https://www.bernzzdigitalsolutions.co.ke",
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await initialize();
  const dehydratedState = await prefetchData();

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <ClientSideWrapper dehydratedState={dehydratedState}>
          {children}
        </ClientSideWrapper>
        <ToastContainer position="bottom-left" />
      </body>
    </html>
  );
}
