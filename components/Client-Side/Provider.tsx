"use client";
import {
  QueryClientProvider,
  HydrationBoundary,
  QueryClient,
  useIsFetching,
} from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { DehydratedState } from "@tanstack/react-query";
import { getQueryClient } from "./get-query-client";
import NewNavbar from "./Navbar/Navbar";
import Footer from "./Footer/footer";

function LoadingOverlay({ isVisible }: { isVisible: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-[9999] bg-background flex items-center justify-center transition-opacity duration-500 ${
        isVisible ? "opacity-100 visible" : "opacity-0 invisible"
      }`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
}

function LoadingManager({ children }: { children: React.ReactNode }) {
  const [showContent, setShowContent] = useState(false);
  const isFetching = useIsFetching();
  const pathname = usePathname();
  const assetsLoaded = useRef(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingDelayOver, setLoadingDelayOver] = useState(false);

  // Ensure DOM is painted
  useEffect(() => {
    requestAnimationFrame(() => setShowContent(true));
  }, []);

  // Track page transitions
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300); // Ensure smooth transitions
    return () => clearTimeout(timer);
  }, [pathname]);

  // Check if assets are loaded
  useEffect(() => {
    if (document.readyState === "complete") {
      assetsLoaded.current = true;
    } else {
      const handleLoad = () => {
        assetsLoaded.current = true;
      };
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  // Ensure all queries are fetched before hiding loader
  useEffect(() => {
    let delayTimer: NodeJS.Timeout;
    if (assetsLoaded.current && isFetching === 0 && !isTransitioning) {
      delayTimer = setTimeout(() => setLoadingDelayOver(true), 500);
    }
    return () => clearTimeout(delayTimer);
  }, [isFetching, isTransitioning]);

  return (
    <>
      <LoadingOverlay isVisible={!loadingDelayOver} />
      <div
        className={`transition-opacity duration-500 ${loadingDelayOver ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        {children}
      </div>
    </>
  );
}

export default function Providers({
  children,
  dehydratedState,
}: {
  children: React.ReactNode;
  dehydratedState?: DehydratedState;
}) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <LoadingManager>
          <NewNavbar />
          {children}
          <Footer />
        </LoadingManager>
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
