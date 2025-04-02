"use client";
import {
  QueryClientProvider,
  HydrationBoundary,
  useIsFetching,
} from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { DehydratedState } from "@tanstack/react-query";
import { getQueryClient } from "./get-query-client";
import NewNavbar from "./Navbar/Navbar";
import Footer from "./Footer/footer";

function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
}

function LoadingManager({ children }: { children: React.ReactNode }) {
  const [showContent, setShowContent] = useState(false);
  const assetsLoaded = useRef(false);
  const isFetching = useIsFetching();
  const [domPainted, setDomPainted] = useState(false);
  const [loadingDelayOver, setLoadingDelayOver] = useState(false);

  // Ensure the DOM is fully painted
  useEffect(() => {
    requestAnimationFrame(() => setDomPainted(true));
  }, []);

  // Add a slight delay after everything is ready to prevent flickering
  useEffect(() => {
    let delayTimer: NodeJS.Timeout;
    if (assetsLoaded.current && isFetching === 0 && domPainted) {
      delayTimer = setTimeout(() => {
        setLoadingDelayOver(true);
        setShowContent(true);
      }, 400); // Small delay to ensure smooth transition
    }
    return () => clearTimeout(delayTimer);
  }, [isFetching, domPainted]);

  // Check if all assets have loaded
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

  return (
    <>
      {!showContent && <LoadingSpinner />}
      <div
        className={`transition-opacity duration-500 ${
          loadingDelayOver ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}>
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
