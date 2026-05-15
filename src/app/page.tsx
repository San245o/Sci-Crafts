import { LoadingScreen } from "@/components/LoadingScreen";
import { LandingPage } from "@/components/LandingPage";
import { LenisSmoothScroll } from "@/components/LenisSmoothScroll";
import { Description } from "@/components/Description";
import { CatalogPage } from "@/components/CatalogPage";
import { AboutUsPage } from "@/components/AboutUsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sci-Crafts - Bangalore 3D Printing Service | Custom Fabrication & Prototypes",
  description: "Bangalore's premier 3D printing service offering custom fabrication, prototypes, and precision manufacturing with Bambu Lab printers and advanced materials.",
};

export default function Home() {
  return (
    <LenisSmoothScroll>
      <main className="relative min-h-screen overflow-x-hidden bg-[#f4ead7] text-[#1a1008]">
        <LandingPage />
        <section className="relative">
          <Description />
          <div className="-mt-[100vh] pt-[100vh]">
            <CatalogPage />
          </div>
          <AboutUsPage />
        </section>
        <LoadingScreen />
      </main>
    </LenisSmoothScroll>
  );
}
