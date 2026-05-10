import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatInr } from "@/lib/marketplace/format";
import { isModelReady, optimizationLabel } from "@/lib/marketplace/optimization";
import { displayNameForOwner, getProfilesById } from "@/lib/marketplace/sellers";
import { isSellerProfileComplete, type SellerProfile } from "@/lib/marketplace/seller-profile";
import { getSellerAvailability } from "@/lib/marketplace/seller-availability";
import { createSignedUrl, getPublicUrls } from "@/lib/marketplace/storage";
import type { Product } from "@/lib/marketplace/types";
import { AvailableSellersPanel } from "./AvailableSellersPanel";
import { BuyButton } from "./BuyButton";
import { ModelViewer } from "./ModelViewer";
import { ProductLikeButton } from "../ProductLikeButton";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single<Product>();

  if (error || !product) notFound();

  const imageUrls = getPublicUrls(supabase, "product-images", product.image_paths || []);
  const ready = isModelReady(product);
  const modelPath = ready ? product.model_path : product.raw_model_path;
  const modelBucket = ready ? "product-models" : "product-models-raw";
  const isGlbModel = (product.model_file_type || "glb") === "glb";
  const [modelUrl, downloadUrl, sellers, userResult] = await Promise.all([
    isGlbModel ? createSignedUrl(supabase, modelBucket, modelPath, false) : Promise.resolve(null),
    createSignedUrl(supabase, modelBucket, modelPath, true),
    getSellerAvailability(supabase),
    supabase.auth.getUser(),
  ]);
  const [profiles, sellerProfileResult, likeResult] = await Promise.all([
    getProfilesById(supabase, [product.owner_id, ...sellers.map((seller) => seller.id)]),
    userResult.data.user
      ? supabase
        .from("seller_profiles")
        .select("city, pincode, location, printers")
        .eq("id", userResult.data.user.id)
        .maybeSingle<SellerProfile>()
      : Promise.resolve({ data: null as SellerProfile | null }),
    userResult.data.user
      ? supabase
        .from("product_likes")
        .select("product_id")
        .eq("user_id", userResult.data.user.id)
        .eq("product_id", product.id)
        .maybeSingle<{ product_id: string }>()
      : Promise.resolve({ data: null as { product_id: string } | null }),
  ]);
  const sellerName = displayNameForOwner(profiles, product.owner_id);
  const availableSellers = sellers.map((seller) => ({
    ...seller,
    sellerName: displayNameForOwner(profiles, seller.id),
  }));
  const sizeInMb = product.model_size_bytes ? `${(product.model_size_bytes / 1024 / 1024).toFixed(1)} MB` : "Unknown";
  const sellerProfile = sellerProfileResult.data;
  const canListModels = isSellerProfileComplete(sellerProfile);
  const currentUser = userResult.data.user;
  const liked = Boolean(likeResult.data);

  return (
    <main className="min-h-screen bg-[#f7f2e8] text-[#171717] font-[family-name:var(--font-inter)] relative z-10">
      <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-8 px-5 py-8 sm:px-8 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-[#171717]/15 pb-5">
          <Link href="/marketplace" className="inline-flex items-center gap-2 rounded-full border border-[#171717]/20 bg-white/55 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] transition hover:border-[#171717]">
            <span aria-hidden="true">←</span>
            Marketplace
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            {currentUser ? (
              <Link href="/marketplace/inbox" className="rounded-full border border-[#171717]/20 bg-white/55 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] transition hover:border-[#171717]">
                Inbox
              </Link>
            ) : null}
            {canListModels ? (
              <Link href="/marketplace/new" className="rounded-full bg-[#d92d20] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#b42318]">
                Add model
              </Link>
            ) : null}
          </div>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.92fr)] lg:items-start">
          <div className="grid gap-5">
            <div className="relative overflow-hidden rounded-md border border-[#171717]/10 bg-[#e5ded0]">
              <div className="absolute left-4 top-4 z-10 rounded-full bg-white/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#171717] backdrop-blur">
                Interactive preview
              </div>
              {modelUrl ? (
                <ModelViewer url={modelUrl} />
              ) : (
                <div className="flex aspect-square items-center justify-center px-6 text-center text-sm font-bold uppercase tracking-[0.18em] text-[#77736b]">
                  {isGlbModel ? "No GLB model uploaded" : "CAD/STL ZIP package. Preview is available for GLB files."}
                </div>
              )}
            </div>

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {imageUrls.map((url) => (
                  <div key={url} className="aspect-square overflow-hidden rounded-md border border-[#171717]/10 bg-[#e5ded0]">
                    <img src={url} alt={product.title} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-8">
            <div className="grid gap-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#0f766e] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                  {product.category}
                </span>
                <span className="rounded-full border border-[#171717]/15 bg-white/65 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#171717]">
                  {isGlbModel ? (isModelReady(product) ? "Optimized" : optimizationLabel(product.optimization_status)) : "ZIP package"}
                </span>
              </div>

              <h1 className="font-[family-name:var(--font-instrument-serif)] text-[clamp(3rem,6vw,6.5rem)] font-semibold uppercase leading-[0.82] text-[#171717]">
                {product.title}
              </h1>

              <div className="grid grid-cols-3 overflow-hidden rounded-md border border-[#171717]/15 bg-white/65">
                <div className="border-r border-[#171717]/15 p-4">
                  <p className="text-lg font-semibold text-[#d92d20]">{formatInr(product.price_cents)}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#686861]">Price</p>
                </div>
                <div className="border-r border-[#171717]/15 p-4">
                  <p className="truncate text-lg font-semibold">{sellerName}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#686861]">Seller</p>
                </div>
                <div className="p-4">
                  <p className="text-lg font-semibold">{sizeInMb}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#686861]">Size</p>
                </div>
              </div>

              <div className="rounded-md border border-[#171717]/15 bg-white/65 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#686861]">File</p>
                <p className="mt-2 text-sm font-semibold">
                  {isGlbModel ? "GLB model" : "CAD/STL ZIP package"}
                </p>
                {product.model_file_name ? <p className="mt-1 break-all text-xs leading-5 text-[#686861]">{product.model_file_name}</p> : null}
              </div>

              <div className="border-y border-[#171717]/15 py-6">
                <p className="whitespace-pre-wrap text-base leading-7 text-[#4b4b45]">{product.description}</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <BuyButton productId={product.id} />
                <ProductLikeButton productId={product.id} initialLiked={liked} />
                {downloadUrl ? (
                  <a
                    href={downloadUrl}
                    download
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#171717]/20 bg-white/65 px-6 text-xs font-bold uppercase tracking-[0.18em] text-[#171717] transition hover:border-[#171717]"
                  >
                    Download model
                  </a>
                ) : null}
              </div>

              <AvailableSellersPanel productId={product.id} sellers={availableSellers} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
