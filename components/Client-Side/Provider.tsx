"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "./get-query-client";
import NewNavbar from "./Navbar/Navbar";
import Footer from "./Footer/footer";

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <NewNavbar />
      {children}
      <Footer />
    </QueryClientProvider>
  );
}
