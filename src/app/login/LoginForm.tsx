"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const next = searchParams.get("next") || "/marketplace";
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

    router.push(next);
    router.refresh();
  }

  async function signUp() {
    setLoading(true);
    setMessage("");

    const origin = window.location.origin;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    setLoading(false);
    setMessage(error ? error.message : "Check your email to verify your account.");
  }

  async function signInWithGoogle() {
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) setMessage(error.message);
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-neutral-700">Required for uploads and mock purchases.</p>
      </div>

      <form onSubmit={signIn} className="space-y-3">
        <label className="block text-sm">
          Email
          <input
            className="mt-1 w-full border border-black px-3 py-2"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            className="mt-1 w-full border border-black px-3 py-2"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            required
          />
        </label>
        <button disabled={loading} className="w-full border border-black bg-black px-4 py-2 text-white disabled:opacity-50">
          Sign in
        </button>
      </form>

      <button onClick={signUp} disabled={loading || !email || !password} className="w-full border border-black px-4 py-2 disabled:opacity-50">
        Create account with email
      </button>

      <button onClick={signInWithGoogle} className="w-full border border-black px-4 py-2">
        Continue with Google
      </button>

      {message ? <p className="text-sm text-neutral-800">{message}</p> : null}
    </div>
  );
}
