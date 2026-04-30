import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import { Cursor } from "@/components/Cursor";
import "./globals.css";

const instrumentSerif = Instrument_Serif({ 
  weight: ["400"],
  subsets: ["latin"],
  style: ["italic", "normal"],
  variable: "--font-instrument-serif",
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
    <html lang="en" className={`h-full antialiased ${instrumentSerif.variable}`}>
      <body className="min-h-full flex flex-col">
        <Cursor />
        {children}
      </body>
    </html>
  );
}
