export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f7f2e8] px-5 py-8 text-[#171717] font-[family-name:var(--font-inter)]">
      <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-8 sm:px-3 lg:px-7">
        <div className="h-12 w-36 animate-pulse rounded-full bg-[#171717]/10" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-end">
          <div>
            <div className="h-4 w-52 animate-pulse rounded-full bg-[#0f766e]/20" />
            <div className="mt-5 h-20 max-w-3xl animate-pulse rounded-md bg-[#171717]/10" />
            <div className="mt-4 h-5 w-full max-w-xl animate-pulse rounded-full bg-[#171717]/10" />
          </div>
          <div className="h-28 animate-pulse rounded-md border border-[#171717]/10 bg-white/55" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="grid gap-3">
              <div className="aspect-[4/5] animate-pulse rounded-md bg-[#171717]/10" />
              <div className="h-5 animate-pulse rounded-full bg-[#171717]/10" />
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-[#171717]/10" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
