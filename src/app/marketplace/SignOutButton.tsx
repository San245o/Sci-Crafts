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
    <button onClick={signOut} disabled={loading} className="border border-black px-3 py-2 disabled:opacity-50">
      Sign out
    </button>
  );
}
