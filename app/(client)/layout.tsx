import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { initialize } from "@/lib/main";

initialize();

const roboto = Roboto({
  subsets: ["latin"],
  weight: "400",
});

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
      <body className={roboto.className} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
