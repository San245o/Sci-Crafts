import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-24 text-black">
      <Link href="/marketplace" className="text-sm underline">Back to marketplace</Link>
      <div className="mt-10">
        <Suspense fallback={<p>Loading...</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
