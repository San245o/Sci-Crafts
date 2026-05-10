export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f7f2e8] px-5 py-8 text-[#171717] font-[family-name:var(--font-inter)]">
      <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-8 sm:px-3 lg:px-7">
        <div className="h-12 w-40 animate-pulse rounded-full bg-[#171717]/10" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.92fr)]">
          <div className="grid gap-5">
            <div className="h-[min(68vh,680px)] min-h-[360px] animate-pulse rounded-md bg-[#171717]/10" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="aspect-square animate-pulse rounded-md bg-[#171717]/10" />
              ))}
            </div>
          </div>
          <div className="grid content-start gap-6">
            <div className="h-8 w-44 animate-pulse rounded-full bg-[#0f766e]/20" />
            <div className="h-24 animate-pulse rounded-md bg-[#171717]/10" />
            <div className="h-28 animate-pulse rounded-md border border-[#171717]/10 bg-white/55" />
            <div className="h-32 animate-pulse rounded-md bg-[#171717]/10" />
          </div>
        </div>
      </div>
    </main>
  );
}
