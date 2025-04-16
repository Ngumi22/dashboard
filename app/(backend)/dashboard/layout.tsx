import SideBar from "@/components/admin-panel/sideBar-nav";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import "@/app/globals.css";
import DashBoardProvider from "@/components/Client-Side/DashBoardProvider";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className="font">
        <DashBoardProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
            <SideBar />
            {children}
            <Toaster />
          </ThemeProvider>
        </DashBoardProvider>
      </body>
    </html>
  );
}
