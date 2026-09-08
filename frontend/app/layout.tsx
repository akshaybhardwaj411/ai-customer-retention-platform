import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Customer Retention Platform",
  description: "AI-powered customer retention platform for organizations"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
