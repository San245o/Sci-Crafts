import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewProductForm } from "./NewProductForm";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login?next=/marketplace/new");
  }

  return (
    <main className="min-h-screen bg-white px-6 py-24 text-black md:px-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <Link href="/marketplace" className="text-sm underline">Back to marketplace</Link>
        <div>
          <h1 className="text-3xl font-semibold">Add model</h1>
          <p className="mt-2 text-sm text-neutral-700">Uploads are published immediately for the MVP.</p>
        </div>
        <NewProductForm />
      </div>
    </main>
  );
}
