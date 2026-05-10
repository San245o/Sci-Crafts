"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    await supabase.auth.signOut();
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={signOut}
      disabled={loading}
      className="rounded-full border border-[#171717]/20 bg-white/55 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] transition hover:border-[#171717] disabled:cursor-wait disabled:opacity-50"
    >
      {loading ? "Signing out" : "Sign out"}
    </button>
  );
}
