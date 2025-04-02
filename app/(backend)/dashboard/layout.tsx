import SideBar from "@/components/admin-panel/sideBar-nav";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import "@/app/globals.css";
import ClientLayoutWrapper from "@/components/Client-Side/DashBoardProvider";
import { initialize } from "@/lib/MysqlDB/initialize";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only initialize if absolutely necessary on server
  if (process.env.NODE_ENV === "production") {
    await initialize();
  }

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className="font">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <ClientLayoutWrapper>
            <SideBar />
            {children}
          </ClientLayoutWrapper>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
