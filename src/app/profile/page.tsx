import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatInr } from "@/lib/marketplace/format";
import { optimizationLabel } from "@/lib/marketplace/optimization";
import {
  MATERIAL_LABELS,
  getPrinterName,
  isSellerProfileComplete,
  type AccountType,
  type SellerProfile,
} from "@/lib/marketplace/seller-profile";
import { getPublicUrls } from "@/lib/marketplace/storage";
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
    .select("display_name, avatar_url, account_type")
    .eq("id", userData.user.id)
    .maybeSingle<{ display_name: string; avatar_url: string | null; account_type: AccountType | null }>();

  const { data: sellerProfile } = await supabase
    .from("seller_profiles")
    .select("city, pincode, location, printers")
    .eq("id", userData.user.id)
    .maybeSingle<SellerProfile>();

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("owner_id", userData.user.id)
    .order("created_at", { ascending: false })
    .returns<Product[]>();

  const { data: likes, error: likesError } = await supabase
    .from("product_likes")
    .select("product_id, created_at")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })
    .returns<Array<{ product_id: string; created_at: string }>>();

  const likedProductIds = likes?.map((like) => like.product_id) || [];
  const { data: likedProducts, error: likedProductsError } = likedProductIds.length
    ? await supabase
      .from("products")
      .select("*")
      .in("id", likedProductIds)
      .eq("is_published", true)
      .returns<Product[]>()
    : { data: [] as Product[], error: null };

  const productsWithImages = await Promise.all(
    (products || []).map(async (product) => ({
      ...product,
      imageUrls: getPublicUrls(supabase, "product-images", product.image_paths || []),
    })),
  );
  const likedProductsById = new Map((likedProducts || []).map((product) => [product.id, product]));
  const likedProductsWithImages = likedProductIds
    .map((productId) => likedProductsById.get(productId))
    .filter((product): product is Product => Boolean(product))
    .map((product) => ({
      ...product,
      imageUrls: getPublicUrls(supabase, "product-images", product.image_paths || []),
    }));

  const displayName = profile?.display_name || userData.user.email || `User ${userData.user.id.slice(0, 8)}`;
  const canListModels = isSellerProfileComplete(sellerProfile);
  const accountLabel = canListModels ? "Seller" : profile?.account_type === "seller" ? "Seller setup needed" : "Buyer";
  const sellerActionHref = canListModels ? "/marketplace/new" : "/marketplace/onboarding?next=/marketplace/new&intent=seller";
  const sellerActionLabel = canListModels ? "Add model" : "Become seller";

  return (
    <main className="min-h-screen bg-[#f7f2e8] px-5 py-8 text-[#171717] font-[family-name:var(--font-inter)] sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-[86rem] flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#171717]/15 pb-5">
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} className="h-16 w-16 rounded-full border border-[#171717]/20 object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#171717]/20 bg-white/65 text-xl">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f766e]">{accountLabel}</p>
              <h1 className="mt-1 text-3xl font-semibold">My profile</h1>
              <p className="mt-1 text-sm text-[#686861]">{displayName}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.16em]">
            <Link href="/marketplace" className="rounded-full border border-[#171717]/20 bg-white/55 px-4 py-2.5 transition hover:border-[#171717]">Marketplace</Link>
            <Link href="/marketplace/inbox" className="rounded-full border border-[#171717]/20 bg-white/55 px-4 py-2.5 transition hover:border-[#171717]">Inbox</Link>
            <Link href={sellerActionHref} className="rounded-full bg-[#d92d20] px-4 py-2.5 text-white transition hover:bg-[#b42318]">{sellerActionLabel}</Link>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="grid gap-6">
            <div>
              <h2 className="text-xl font-semibold">My uploaded models</h2>
              <p className="mt-1 text-sm text-[#686861]">{canListModels ? "Your listings." : "Seller setup required."}</p>
              {error ? <p className="mt-4 rounded-md border border-[#d92d20]/30 bg-[#fff4f2] px-4 py-3 text-sm font-semibold text-[#b42318]">Failed to load uploads: {error.message}</p> : null}
            </div>

            <div className="grid gap-4">
              {productsWithImages.map((product) => (
                <Link key={product.id} href={`/marketplace/${product.id}`} className="grid gap-4 rounded-md border border-[#171717]/15 bg-white/65 p-4 transition hover:border-[#171717]/45 sm:grid-cols-[6rem_minmax(0,1fr)]">
                  {product.imageUrls[0] ? (
                    <img src={product.imageUrls[0]} alt={product.title} className="h-24 w-24 rounded-md border border-[#171717]/10 object-cover" />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-md border border-[#171717]/10 bg-[#e5ded0] text-xs font-bold uppercase tracking-[0.16em] text-[#77736b]">No image</div>
                  )}
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 className="min-w-0 text-xl font-semibold">{product.title}</h3>
                      <p className="text-sm font-bold text-[#d92d20]">{formatInr(product.price_cents)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.16em]">
                      <span className="rounded-full bg-[#0f766e] px-3 py-1.5 text-white">{product.category}</span>
                      <span className="rounded-full border border-[#171717]/15 bg-white px-3 py-1.5 text-[#686861]">{product.is_published ? "Published" : "Draft"}</span>
                      <span className="rounded-full border border-[#171717]/15 bg-white px-3 py-1.5 text-[#686861]">{optimizationLabel(product.optimization_status)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {!error && productsWithImages.length === 0 ? (
              <div className="rounded-md border border-dashed border-[#171717]/25 bg-white/45 px-6 py-12 text-sm leading-6 text-[#686861]">
                {canListModels ? "No uploaded models yet." : "Complete seller setup to unlock model uploads."}
              </div>
            ) : null}

            <div className="pt-4">
              <h2 className="text-xl font-semibold">Liked models</h2>
              <p className="mt-1 text-sm text-[#686861]">Saved from the marketplace.</p>
              {likesError || likedProductsError ? (
                <p className="mt-4 rounded-md border border-[#d92d20]/30 bg-[#fff4f2] px-4 py-3 text-sm font-semibold text-[#b42318]">
                  Failed to load likes: {likesError?.message || likedProductsError?.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {likedProductsWithImages.map((product) => (
                <Link key={product.id} href={`/marketplace/${product.id}`} className="grid gap-3 rounded-md border border-[#171717]/15 bg-white/65 p-4 transition hover:border-[#171717]/45 sm:grid-cols-[5rem_minmax(0,1fr)]">
                  {product.imageUrls[0] ? (
                    <img src={product.imageUrls[0]} alt={product.title} className="h-20 w-20 rounded-md border border-[#171717]/10 object-cover" />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-md border border-[#171717]/10 bg-[#e5ded0] text-xs font-bold uppercase tracking-[0.16em] text-[#77736b]">No image</div>
                  )}
                  <div className="min-w-0 space-y-2">
                    <h3 className="truncate text-base font-semibold">{product.title}</h3>
                    <p className="text-sm font-bold text-[#d92d20]">{formatInr(product.price_cents)}</p>
                    <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-[#686861]">{product.category}</p>
                  </div>
                </Link>
              ))}
            </div>

            {!likesError && !likedProductsError && likedProductsWithImages.length === 0 ? (
              <div className="rounded-md border border-dashed border-[#171717]/25 bg-white/45 px-6 py-10 text-sm leading-6 text-[#686861]">
                No liked models yet.
              </div>
            ) : null}
          </div>

          <aside className="grid content-start gap-5 rounded-md border border-[#171717]/15 bg-white/65 p-5">
            <div>
              <p className="text-sm font-semibold">Marketplace role</p>
              <p className="mt-2 text-3xl font-semibold">{accountLabel}</p>
            </div>

            {sellerProfile ? (
              <div className="grid gap-4 border-t border-[#171717]/15 pt-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#686861]">Location</p>
                  <p className="mt-2 text-sm leading-6">{sellerProfile.location}, {sellerProfile.city} {sellerProfile.pincode}</p>
                </div>

                <div className="grid gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#686861]">Printers</p>
                  {(sellerProfile.printers || []).map((printer) => (
                    <div key={`${printer.printerModel}-${printer.serialNumber}`} className="rounded-md border border-[#171717]/15 bg-[#f7f2e8] p-3">
                      <p className="font-semibold">{getPrinterName(printer.printerModel)}</p>
                      <p className="mt-1 text-xs text-[#686861]">Serial: {printer.serialNumber}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {printer.materialRates.map((rate) => (
                          <span key={rate.material} className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#686861]">
                            {MATERIAL_LABELS[rate.material]} - ₹{rate.pricePerGram}/g
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="border-t border-[#171717]/15 pt-5 text-sm leading-6 text-[#686861]">
                Buyer accounts use the catalog without printer verification.
              </p>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
