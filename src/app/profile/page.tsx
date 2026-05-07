import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatInr } from "@/lib/marketplace/format";
import { optimizationLabel } from "@/lib/marketplace/optimization";
import { createSignedUrls } from "@/lib/marketplace/storage";
import type { Product } from "@/lib/marketplace/types";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login?next=/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", userData.user.id)
    .maybeSingle<{ display_name: string; avatar_url: string | null }>();

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("owner_id", userData.user.id)
    .order("created_at", { ascending: false })
    .returns<Product[]>();

  const productsWithImages = await Promise.all(
    (products || []).map(async (product) => ({
      ...product,
      imageUrls: await createSignedUrls(supabase, "product-images", product.image_paths || []),
    })),
  );

  const displayName = profile?.display_name || userData.user.email || `User ${userData.user.id.slice(0, 8)}`;

  return (
    <main className="min-h-screen bg-white px-6 py-24 text-black md:px-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black pb-4">
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} className="h-16 w-16 rounded-full border border-black object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-black text-xl">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-semibold">My profile</h1>
              <p className="mt-1 text-sm text-neutral-700">{displayName}</p>
            </div>
          </div>
          <div className="flex gap-3 text-sm">
            <Link href="/marketplace" className="border border-black px-3 py-2">Marketplace</Link>
            <Link href="/marketplace/new" className="border border-black bg-black px-3 py-2 text-white">Add model</Link>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-medium">My uploaded models</h2>
          {error ? <p className="mt-4 text-sm">Failed to load uploads: {error.message}</p> : null}

          <div className="mt-6 space-y-6">
            {productsWithImages.map((product) => (
              <Link key={product.id} href={`/marketplace/${product.id}`} className="block border-b border-neutral-300 pb-6">
                <div className="flex gap-4">
                  {product.imageUrls[0] ? (
                    <img src={product.imageUrls[0]} alt={product.title} className="h-24 w-24 border border-black object-cover" />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center border border-black text-xs">No image</div>
                  )}
                  <div className="space-y-1">
                    <h3 className="text-xl font-medium">{product.title}</h3>
                    <p>{formatInr(product.price_cents)}</p>
                    <p className="text-sm uppercase tracking-wide text-neutral-700">{product.category}</p>
                    <p className="text-sm text-neutral-700">{product.is_published ? "Published" : "Not published"}</p>
                    <p className="text-sm text-neutral-700">{optimizationLabel(product.optimization_status)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {!error && productsWithImages.length === 0 ? (
            <p className="mt-6 text-sm">You have not uploaded any models yet.</p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
