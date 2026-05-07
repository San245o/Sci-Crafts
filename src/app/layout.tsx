import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import { Cursor } from "@/components/Cursor";
import { Navigation } from "@/components/Navigation";
import "./globals.css";

const instrumentSerif = Instrument_Serif({ 
  weight: ["400"],
  subsets: ["latin"],
  style: ["italic", "normal"],
  variable: "--font-instrument-serif",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

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
    <html lang="en" className={`h-full antialiased ${instrumentSerif.variable} ${inter.variable}`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-inter)]">
        <Cursor />
        <Navigation />
        {children}
      </body>
    </html>
  );
}
