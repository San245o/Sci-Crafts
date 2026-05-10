import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatInr } from "@/lib/marketplace/format";
import { displayNameForOwner, getProfilesById } from "@/lib/marketplace/sellers";
import {
  isSellerProfileComplete,
  type SellerProfile,
} from "@/lib/marketplace/seller-profile";
import { getSellerAvailability } from "@/lib/marketplace/seller-availability";
import { getPublicUrls } from "@/lib/marketplace/storage";
import type { Product } from "@/lib/marketplace/types";
import { ProductLikeButton } from "./ProductLikeButton";
import { SignOutButton } from "./SignOutButton";

export const dynamic = "force-dynamic";

function sellerCountLabel(count: number) {
  return `${count} Seller${count === 1 ? "" : "s"}`;
}

export default async function MarketplacePage() {
  const supabase = await createClient();
  const [productsResult, userResult, sellers] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .returns<Product[]>(),
    supabase.auth.getUser(),
    getSellerAvailability(supabase),
  ]);

  const { data: products, error } = productsResult;
  const productList = products || [];
  const currentUser = userResult.data.user;
  const [profiles, sellerProfileResult, likesResult] = await Promise.all([
    getProfilesById(supabase, productList.map((product) => product.owner_id)),
    currentUser
      ? supabase
        .from("seller_profiles")
        .select("city, pincode, location, printers")
        .eq("id", currentUser.id)
        .maybeSingle<SellerProfile>()
      : Promise.resolve({ data: null as SellerProfile | null }),
    currentUser
      ? supabase
        .from("product_likes")
        .select("product_id")
        .eq("user_id", currentUser.id)
        .returns<Array<{ product_id: string }>>()
      : Promise.resolve({ data: [] as Array<{ product_id: string }> }),
  ]);
  const sellerProfile = sellerProfileResult.data;
  const likedProductIds = new Set((likesResult.data || []).map((like) => like.product_id));

  const productsWithImages = productList.map((product) => ({
    ...product,
    imageUrls: getPublicUrls(supabase, "product-images", product.image_paths || []),
    sellerName: displayNameForOwner(profiles, product.owner_id),
  }));
  const categoryCount = new Set(productList.map((product) => product.category)).size;
  const canListModels = isSellerProfileComplete(sellerProfile);
  const sellerOnboardingPath = "/marketplace/onboarding?next=/marketplace/new&intent=seller";
  const listModelHref = canListModels
    ? "/marketplace/new"
    : currentUser
      ? sellerOnboardingPath
      : `/login?next=${encodeURIComponent(sellerOnboardingPath)}`;
  const listModelLabel = canListModels ? "Add model" : "Sell models";
  const sellerCount = sellers.length;
  const sellerLabel = sellerCountLabel(sellerCount);

  return (
    <main className="min-h-screen bg-[#f7f2e8] text-[#171717] font-[family-name:var(--font-inter)] relative z-10">
      <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-10 px-5 py-8 sm:px-8 lg:px-12">
        <header className="flex flex-col gap-8 border-b border-[#171717]/15 pb-8">
          <nav className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="text-sm font-semibold uppercase tracking-[0.24em] text-[#171717]">
              Sci-Crafts
            </Link>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.16em]">
              <Link href="/" className="rounded-full border border-[#171717]/20 bg-white/55 px-4 py-2.5 transition hover:border-[#171717]">
                Home
              </Link>
              {currentUser ? (
                <Link href="/profile" className="rounded-full border border-[#171717]/20 bg-white/55 px-4 py-2.5 transition hover:border-[#171717]">
                  Profile
                </Link>
              ) : null}
              {currentUser ? (
                <Link href="/marketplace/inbox" className="rounded-full border border-[#171717]/20 bg-white/55 px-4 py-2.5 transition hover:border-[#171717]">
                  Inbox
                </Link>
              ) : null}
              <Link href={listModelHref} className="rounded-full bg-[#d92d20] px-4 py-2.5 text-white shadow-sm transition hover:bg-[#b42318]">
                {listModelLabel}
              </Link>
              {currentUser ? (
                <SignOutButton />
              ) : (
                <Link href="/login?next=/marketplace" className="rounded-full border border-[#171717]/20 bg-white/55 px-4 py-2.5 transition hover:border-[#171717]">
                  Sign in
                </Link>
              )}
            </div>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-end">
            <div className="max-w-4xl">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.26em] text-[#0f766e]">Digital fabrication catalog</p>
              <h1 className="font-[family-name:var(--font-instrument-serif)] text-[clamp(3.2rem,8vw,8.5rem)] font-semibold uppercase leading-[0.78] text-[#171717]">
                Marketplace
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#4b4b45]">Browse printable models from verified sellers.</p>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-3 overflow-hidden rounded-md border border-[#171717]/15 bg-white/65">
                <div className="border-r border-[#171717]/15 p-4">
                  <p className="text-2xl font-semibold">{productList.length}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#686861]">Models</p>
                </div>
                <div className="border-r border-[#171717]/15 p-4">
                  <p className="text-2xl font-semibold">{categoryCount}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#686861]">Categories</p>
                </div>
                <div className="p-4">
                  <p className="text-2xl font-semibold">{sellerCount}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#686861]">Sellers</p>
                </div>
              </div>

              <div className="rounded-md border border-[#171717]/15 bg-white/65 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#686861]">Upload formats</p>
                <p className="mt-2 text-sm font-semibold">GLB and ZIP</p>
              </div>
            </div>
          </div>
        </header>

        {error ? (
          <p className="rounded-md border border-[#d92d20]/30 bg-[#fff4f2] px-4 py-3 text-sm font-semibold text-[#b42318]">
            Failed to load products: {error.message}
          </p>
        ) : null}

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Latest models</h2>
              <p className="mt-1 text-sm text-[#686861]">Sorted by newest.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productsWithImages.map((product) => (
              <article key={product.id} className="group flex min-w-0 flex-col gap-3">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md border border-[#171717]/10 bg-[#e5ded0]">
                  <Link href={`/marketplace/${product.id}`} className="block h-full w-full">
                    {product.imageUrls[0] ? (
                      <img src={product.imageUrls[0]} alt={product.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold uppercase tracking-[0.2em] text-[#77736b]">No image</div>
                    )}
                    <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-white/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#171717] backdrop-blur">
                        {product.category}
                      </span>
                      <span className="rounded-full bg-[#0f766e] px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-white">
                        ({sellerLabel})
                      </span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 translate-y-full bg-[#171717]/88 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition group-hover:translate-y-0">
                      View model
                    </div>
                  </Link>
                  <div className="absolute bottom-3 right-3 z-10">
                    <ProductLikeButton productId={product.id} initialLiked={likedProductIds.has(product.id)} />
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-start justify-between gap-4">
                    <Link href={`/marketplace/${product.id}`} className="min-w-0 text-lg font-semibold leading-tight text-[#171717] transition hover:text-[#d92d20]">
                      {product.title}
                    </Link>
                    <span className="shrink-0 text-sm font-bold text-[#d92d20]">{formatInr(product.price_cents)}</span>
                  </div>
                  <p className="truncate text-xs font-bold uppercase tracking-[0.16em] text-[#686861]">By {product.sellerName}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {!error && productsWithImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-[#171717]/25 bg-white/45 px-6 py-20 text-center">
            <p className="font-[family-name:var(--font-instrument-serif)] text-3xl italic text-[#171717]">No models listed yet</p>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#686861]">A verified seller can upload the first GLB model or ZIP CAD/STL package after completing printer and material pricing setup.</p>
            <Link href={listModelHref} className="mt-6 rounded-full bg-[#d92d20] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#b42318]">
              {listModelLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
