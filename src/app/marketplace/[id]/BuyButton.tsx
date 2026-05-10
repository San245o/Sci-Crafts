"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function BuyButton({ productId }: { productId: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function buy() {
    setLoading(true);
    setMessage("");

    const { data } = await supabase.auth.getUser();
    setLoading(false);

    if (!data.user) {
      router.push(`/login?next=${encodeURIComponent(`/marketplace/${productId}`)}`);
      return;
    }

    setMessage("Mock payment complete. No real payment was charged.");
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <button
        onClick={buy}
        disabled={loading}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d92d20] px-6 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#b42318] disabled:cursor-wait disabled:opacity-50"
      >
        {loading ? "Checking account" : "Buy now"}
      </button>
      {message ? <p className="max-w-sm text-xs font-semibold leading-5 text-[#0f766e]">{message}</p> : null}
    </div>
  );
}
