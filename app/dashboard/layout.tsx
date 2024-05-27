import DashboardHeader from "@/components/dashboard-header";
import { Toaster } from "@/components/ui/toaster";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <DashboardHeader />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
