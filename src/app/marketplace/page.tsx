import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatInr } from "@/lib/marketplace/format";
import { optimizationLabel } from "@/lib/marketplace/optimization";
import { displayNameForOwner, getProfilesById } from "@/lib/marketplace/sellers";
import { createSignedUrls } from "@/lib/marketplace/storage";
import type { Product } from "@/lib/marketplace/types";
import { SignOutButton } from "./SignOutButton";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .returns<Product[]>();

  const { data: userData } = await supabase.auth.getUser();
  const profiles = await getProfilesById(supabase, (products || []).map((product) => product.owner_id));

  const productsWithImages = await Promise.all(
    (products || []).map(async (product) => ({
      ...product,
      imageUrls: await createSignedUrls(supabase, "product-images", product.image_paths || []),
      sellerName: displayNameForOwner(profiles, product.owner_id),
    })),
  );

  return (
    <main className="min-h-screen bg-white px-6 py-24 text-black md:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black pb-4">
          <div>
            <h1 className="text-3xl font-semibold">Marketplace</h1>
            <p className="mt-1 text-sm text-neutral-700">Browse uploaded GLB models.</p>
          </div>
          <div className="flex gap-3 text-sm">
            <Link href="/" className="border border-black px-3 py-2">Home</Link>
            {userData.user ? <Link href="/profile" className="border border-black px-3 py-2">My profile</Link> : null}
            <Link href="/marketplace/new" className="border border-black bg-black px-3 py-2 text-white">Add model</Link>
            {userData.user ? <SignOutButton /> : <Link href="/login?next=/marketplace" className="border border-black px-3 py-2">Sign in</Link>}
          </div>
        </div>

        {error ? <p className="mt-8 text-sm">Failed to load products: {error.message}</p> : null}

        <div className="mt-8 space-y-6">
          {productsWithImages.map((product) => (
            <Link key={product.id} href={`/marketplace/${product.id}`} className="block border-b border-neutral-300 pb-6">
              <div className="flex gap-4">
                {product.imageUrls[0] ? (
                  <img src={product.imageUrls[0]} alt={product.title} className="h-24 w-24 border border-black object-cover" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center border border-black text-xs">No image</div>
                )}
                <div className="space-y-1">
                  <h2 className="text-xl font-medium">{product.title}</h2>
                  <p className="text-sm text-neutral-700">Listed by {product.sellerName}</p>
                  <p>{formatInr(product.price_cents)}</p>
                  <p className="text-sm uppercase tracking-wide text-neutral-700">{product.category}</p>
                  <p className="text-sm text-neutral-700">{optimizationLabel(product.optimization_status)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!error && productsWithImages.length === 0 ? (
          <p className="mt-8 text-sm">No products yet. Add the first model after signing in.</p>
        ) : null}
      </div>
    </main>
  );
}
