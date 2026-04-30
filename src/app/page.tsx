import { LoadingScreen } from "@/components/LoadingScreen";
import { LandingPage } from "@/components/LandingPage";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4ead7] text-[#1a1008]">
      <LandingPage />
      <LoadingScreen />
    </main>
  );
}
