import "../globals.css";
import { prefetchData } from "@/lib/actions/serverSideFetching";
import { metadata } from "@/lib/Metadata/RootMetadata";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import Loading from "./loading";

export { metadata };

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
        <Suspense fallback={<Loading />}>
          <Providers dehydratedState={dehydratedState}>
            {children}
            <ToastContainer position="bottom-left" />
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
