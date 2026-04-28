import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Cursor } from "@/components/Cursor";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en" className={`h-full antialiased cursor-none ${inter.className}`}>
      <body className="min-h-full flex flex-col cursor-none">
        <Cursor />
        {children}
      </body>
    </html>
  );
}
