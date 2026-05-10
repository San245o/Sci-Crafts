import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f7f2e8] px-5 py-8 text-[#171717] font-[family-name:var(--font-inter)] sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-[86rem]">
        <nav className="border-b border-[#171717]/15 pb-5">
          <Link href="/marketplace" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#171717]/20 bg-white/55 px-4 text-xs font-bold uppercase tracking-[0.16em] transition hover:border-[#171717]">
            <span aria-hidden="true">←</span>
            Marketplace
          </Link>
        </nav>
      </div>
      <div className="mt-12">
        <Suspense fallback={<p>Loading...</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
