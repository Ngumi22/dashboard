import "@/app/globals.css";
import type React from "react"; // Import React

export default function UnauthorisedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
