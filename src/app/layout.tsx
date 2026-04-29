import type { Metadata } from "next";
import { Cursor } from "@/components/Cursor";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sci-Fi Crafts",
  description: "A Sci-Fi Crafts web experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased cursor-none">
      <body className="min-h-full flex flex-col cursor-none">
        <Cursor />
        {children}
      </body>
    </html>
  );
}
