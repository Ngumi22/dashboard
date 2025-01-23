export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Call the initialize API route on server start
  const API_URL = process.env.API_URL || "http://localhost:3000";
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      console.error("Database initialization failed on startup.");
    }
  } catch (error) {
    console.error("Error calling the initialize API:", error);
  }

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
