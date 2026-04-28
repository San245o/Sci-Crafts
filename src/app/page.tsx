import { LoadingScreen } from "@/components/LoadingScreen";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4ead7] text-[#1a1008]">
      <section className="flex min-h-screen items-center justify-center px-5">
        <div className="w-full text-center">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.38em] text-red-700/70 sm:text-sm">
            Scientific craft studio
          </p>
          <h1 className="mx-auto max-w-6xl text-[clamp(3.25rem,13vw,12rem)] font-black uppercase leading-[0.82] tracking-tighter text-red-700">
            Sci-Fi Crafts
          </h1>
        </div>
      </section>

      <LoadingScreen />
    </main>
  );
}
