import type { Metadata } from "next";
import "../globals.css";
import { prefetchData } from "@/lib/actions/serverSideFetching";
import dynamic from "next/dynamic";

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
// Dynamic import for Providers to separate its bundle
const Providers = dynamic(() => import("@/components/Client-Side/Provider"), {
  ssr: false,
  loading: () => null,
});

// Delay loading ToastContainer until after hydration
const ToastContainer = dynamic(
  () => import("react-toastify").then((c) => c.ToastContainer),
  {
    ssr: false,
    loading: () => null,
  }
);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Prefetch only critical data
  const dehydratedState = await prefetchData();

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Providers dehydratedState={dehydratedState}>
          {children}
          <ToastContainer position="bottom-left" />
        </Providers>
      </body>
    </html>
  );
}
