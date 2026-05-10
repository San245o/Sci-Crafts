import Link from "next/link";
import { redirect } from "next/navigation";
import { getConversationSummaries } from "@/lib/marketplace/conversation-data";
import { createClient } from "@/lib/supabase/server";
import { InboxClient } from "./InboxClient";

export const dynamic = "force-dynamic";

export default async function MarketplaceInboxPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect(`/login?next=${encodeURIComponent("/marketplace/inbox")}`);
  }

  const { conversations, error } = await getConversationSummaries(supabase, userData.user.id);

  return (
    <main className="min-h-screen bg-[#f7f2e8] text-[#171717] font-[family-name:var(--font-inter)] relative z-10">
      <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-8 px-5 py-8 sm:px-8 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-[#171717]/15 pb-5">
          <Link href="/marketplace" className="inline-flex items-center gap-2 rounded-full border border-[#171717]/20 bg-white/55 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] transition hover:border-[#171717]">
            <span aria-hidden="true">←</span>
            Marketplace
          </Link>
          <Link href="/profile" className="rounded-full border border-[#171717]/20 bg-white/55 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] transition hover:border-[#171717]">
            Profile
          </Link>
        </nav>

        <header className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.26em] text-[#0f766e]">Buyer and seller messages</p>
            <h1 className="font-[family-name:var(--font-instrument-serif)] text-[clamp(3rem,7vw,7rem)] font-semibold uppercase leading-[0.82]">
              Inbox
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#4b4b45]">
              Continue product conversations with buyers and sellers.
            </p>
          </div>
        </header>

        {error ? (
          <p className="rounded-md border border-[#d92d20]/30 bg-[#fff4f2] px-4 py-3 text-sm font-semibold text-[#b42318]">
            Failed to load inbox: {error.message}
          </p>
        ) : null}

        <InboxClient initialConversations={error ? [] : conversations} />
      </div>
    </main>
  );
}
