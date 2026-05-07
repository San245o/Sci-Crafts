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
    <div className="space-y-2">
      <button onClick={buy} disabled={loading} className="border border-black bg-black px-4 py-2 text-white disabled:opacity-50">
        Buy
      </button>
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}
