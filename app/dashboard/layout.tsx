import DashboardHeader from "@/components/dashboard-header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <DashboardHeader />
        {children}
      </body>
    </html>
  );
}
