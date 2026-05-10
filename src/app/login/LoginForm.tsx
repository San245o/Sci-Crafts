"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const rawNext = searchParams.get("next") || "/marketplace";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/marketplace";
  const postAuthPath = next.startsWith("/marketplace/onboarding")
    ? next
    : `/marketplace/onboarding?next=${encodeURIComponent(next)}`;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push(postAuthPath);
    router.refresh();
  }

  async function signUp() {
    setLoading(true);
    setMessage("");

    const origin = window.location.origin;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(postAuthPath)}`,
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.session) {
      router.push(postAuthPath);
      router.refresh();
      return;
    }

    setMessage("Check your email to verify your account, then choose buyer or seller.");
  }

  async function signInWithGoogle() {
    setLoading(true);
    setMessage("");
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(postAuthPath)}`,
      },
    });

    setLoading(false);
    if (error) setMessage(error.message);
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
      <div>
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.26em] text-[#0f766e]">Marketplace account</p>
        <h1 className="font-[family-name:var(--font-instrument-serif)] text-[clamp(3rem,7vw,6.5rem)] font-semibold uppercase leading-[0.82]">
          Sign in
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[#4b4b45]">
          Continue with Google or email first. After authentication, choose buyer for the product catalog or seller to verify printers and material rates.
        </p>
      </div>

      <div className="grid gap-5 rounded-md border border-[#171717]/15 bg-white/65 p-5 sm:p-7">
        <form onSubmit={signIn} className="space-y-4">
          <label className="grid gap-2 text-sm font-semibold">
            Email
            <input
              className="min-h-12 rounded-md border border-[#171717]/15 bg-white px-4 outline-none transition focus:border-[#0f766e]"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Password
            <input
              className="min-h-12 rounded-md border border-[#171717]/15 bg-white px-4 outline-none transition focus:border-[#0f766e]"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
          </label>
          <button disabled={loading} className="min-h-12 w-full rounded-full bg-[#171717] px-4 text-xs font-bold uppercase tracking-[0.18em] text-white disabled:opacity-50">
            {loading ? "Checking" : "Continue with email"}
          </button>
        </form>

        <button onClick={signUp} disabled={loading || !email || !password} className="min-h-12 w-full rounded-full border border-[#171717]/20 bg-white/65 px-4 text-xs font-bold uppercase tracking-[0.18em] transition hover:border-[#171717] disabled:opacity-50">
          Create account with email
        </button>

        <button onClick={signInWithGoogle} disabled={loading} className="min-h-12 w-full rounded-full border border-[#171717]/20 bg-white/65 px-4 text-xs font-bold uppercase tracking-[0.18em] transition hover:border-[#171717] disabled:opacity-50">
          Continue with Google
        </button>

        {message ? <p className="rounded-md border border-[#171717]/15 bg-[#f7f2e8] px-4 py-3 text-sm font-semibold text-[#4b4b45]">{message}</p> : null}
      </div>
    </div>
  );
}
