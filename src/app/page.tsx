import { LoadingScreen } from "@/components/LoadingScreen";
import { LandingPage } from "@/components/LandingPage";
import { LenisSmoothScroll } from "@/components/LenisSmoothScroll";
import { Description } from "@/components/Description";

export default function Home() {
  return (
    <LenisSmoothScroll>
      <main className="relative min-h-screen overflow-x-hidden bg-[#f4ead7] text-[#1a1008]">
        <LandingPage />
        <Description />
        <LoadingScreen />
      </main>
    </LenisSmoothScroll>
  );
}
