import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSellerProfileComplete, type SellerProfile } from "@/lib/marketplace/seller-profile";
import { NewProductForm } from "./NewProductForm";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const sellerOnboardingPath = "/marketplace/onboarding?next=/marketplace/new&intent=seller";

  if (!data.user) {
    redirect(`/login?next=${encodeURIComponent(sellerOnboardingPath)}`);
  }

  const { data: sellerProfile } = await supabase
    .from("seller_profiles")
    .select("city, pincode, location, printers")
    .eq("id", data.user.id)
    .maybeSingle<SellerProfile>();

  if (!isSellerProfileComplete(sellerProfile)) {
    redirect(sellerOnboardingPath);
  }

  return (
    <main className="min-h-screen bg-[#f7f2e8] text-[#171717] font-[family-name:var(--font-inter)]">
      <div className="mx-auto flex w-full max-w-[76rem] flex-col gap-8 px-5 py-8 sm:px-8 lg:px-12">
        <nav className="border-b border-[#171717]/15 pb-5">
          <Link href="/marketplace" className="inline-flex items-center gap-2 rounded-full border border-[#171717]/20 bg-white/55 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] transition hover:border-[#171717]">
            <span aria-hidden="true">←</span>
            Marketplace
          </Link>
        </nav>

        <header className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.26em] text-[#0f766e]">Seller studio</p>
            <h1 className="font-[family-name:var(--font-instrument-serif)] text-[clamp(3rem,7vw,7rem)] font-semibold uppercase leading-[0.82]">
              Add model
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#4b4b45]">
              Publish a GLB preview model or a ZIP package containing CAD/STL files from your verified seller account. GLB optimization starts automatically after upload.
            </p>
          </div>
          <div className="rounded-md border border-[#171717]/15 bg-white/65 p-5">
            <p className="text-sm font-semibold">Upload limits</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="font-bold">15 MB</p>
                <p className="text-xs uppercase tracking-[0.16em] text-[#686861]">GLB or ZIP</p>
              </div>
              <div>
                <p className="font-bold">5 MB</p>
                <p className="text-xs uppercase tracking-[0.16em] text-[#686861]">Per image</p>
              </div>
            </div>
          </div>
        </header>

        <NewProductForm />
      </div>
    </main>
  );
}
