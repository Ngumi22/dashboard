import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { initialize } from "@/lib/main";
import Loading from "./loading";

initialize();

const roboto = Roboto({
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
      <body className={roboto.className} suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <Loading /> {/* Render the loading component */}
          {children} {/* Render the actual page content */}
        </ThemeProvider>
      </body>
    </html>
  );
}
