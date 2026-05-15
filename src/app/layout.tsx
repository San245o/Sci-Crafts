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
  title: "Sci-Crafts - Bangalore 3D Printing Service | Custom Fabrication & Prototypes",
  description: "Bangalore's premier 3D printing service offering custom fabrication, prototypes, and precision manufacturing with Bambu Lab printers and advanced materials like PLA, PETG, TPU, and ABS.",
  keywords: "3D printing Bangalore, 3D printing service, custom fabrication, prototypes, 3D printing, Bambu Lab, precision manufacturing",
  authors: [{ name: "Sci-Crafts" }],
  openGraph: {
    title: "Sci-Crafts - Bangalore 3D Printing Service",
    description: "Transform your designs into reality with Bangalore's trusted 3D printing service",
    type: "website",
  },
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
