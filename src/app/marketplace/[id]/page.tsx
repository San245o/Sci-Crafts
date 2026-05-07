import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatInr } from "@/lib/marketplace/format";
import { isModelReady, optimizationLabel } from "@/lib/marketplace/optimization";
import { displayNameForOwner, getProfilesById } from "@/lib/marketplace/sellers";
import { createSignedUrl, createSignedUrls } from "@/lib/marketplace/storage";
import type { Product } from "@/lib/marketplace/types";
import { BuyButton } from "./BuyButton";
import { ModelViewer } from "./ModelViewer";

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

  const imageUrls = await createSignedUrls(supabase, "product-images", product.image_paths || []);
  const ready = isModelReady(product);
  const modelUrl = ready ? await createSignedUrl(supabase, "product-models", product.model_path, false) : null;
  const downloadUrl = ready ? await createSignedUrl(supabase, "product-models", product.model_path, true) : null;
  const profiles = await getProfilesById(supabase, [product.owner_id]);
  const sellerName = displayNameForOwner(profiles, product.owner_id);

  return (
    <main className="min-h-screen bg-white px-6 py-24 text-black md:px-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <Link href="/marketplace" className="text-sm underline">Back to marketplace</Link>

        <section className="space-y-4 border-b border-black pb-6">
          <p className="text-sm uppercase tracking-wide text-neutral-700">{product.category}</p>
          <h1 className="text-3xl font-semibold">{product.title}</h1>
          <p className="text-sm text-neutral-700">Listed by {sellerName}</p>
          <p className="text-sm text-neutral-700">Model status: {optimizationLabel(product.optimization_status)}</p>
          {product.optimization_status === "failed" && product.optimization_error ? (
            <p className="text-sm text-neutral-700">Error: {product.optimization_error}</p>
          ) : null}
          <p>{formatInr(product.price_cents)}</p>
          <p className="max-w-2xl whitespace-pre-wrap text-neutral-800">{product.description}</p>
          <div className="flex flex-wrap gap-3">
            <BuyButton productId={product.id} />
            {downloadUrl ? (
              <a href={downloadUrl} className="border border-black px-4 py-2" download>
                Download model
              </a>
            ) : null}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium">3D preview</h2>
          {modelUrl ? (
            <ModelViewer url={modelUrl} />
          ) : (
            <p className="border border-black p-6 text-sm">
              {product.optimization_status === "failed"
                ? "The model could not be optimized. Upload a new GLB from your profile flow when retry support is added."
                : "Model is being optimized. Preview and download will be available soon."}
            </p>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium">Images</h2>
          <div className="space-y-4">
            {imageUrls.map((url) => (
              <img key={url} src={url} alt={product.title} className="max-h-[520px] w-full border border-black object-contain" />
            ))}
            {imageUrls.length === 0 ? <p className="text-sm">No images uploaded.</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
