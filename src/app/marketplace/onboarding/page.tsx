import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  isSellerProfileComplete,
  type AccountType,
  type SellerProfile,
} from "@/lib/marketplace/seller-profile";
import { MarketplaceOnboardingForm } from "./MarketplaceOnboardingForm";

export const dynamic = "force-dynamic";

type OnboardingPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function paramValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function safeNextPath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/marketplace";
  return value;
}

export default async function MarketplaceOnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const nextPath = safeNextPath(paramValue(params.next));
  const intent = paramValue(params.intent);
  const wantsSeller = intent === "seller";
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    const onboardingTarget = `/marketplace/onboarding?next=${encodeURIComponent(nextPath)}${wantsSeller ? "&intent=seller" : ""}`;
    redirect(`/login?next=${encodeURIComponent(onboardingTarget)}`);
  }

  const [{ data: profile }, { data: sellerProfile }] = await Promise.all([
    supabase
      .from("profiles")
      .select("account_type")
      .eq("id", userData.user.id)
      .maybeSingle<{ account_type: AccountType | null }>(),
    supabase
      .from("seller_profiles")
      .select("city, pincode, location, printers")
      .eq("id", userData.user.id)
      .maybeSingle<SellerProfile>(),
  ]);

  const sellerComplete = isSellerProfileComplete(sellerProfile);

  if (!wantsSeller && profile?.account_type === "buyer") {
    redirect(nextPath === "/marketplace/new" ? "/marketplace" : nextPath);
  }

  if (!wantsSeller && profile?.account_type === "seller" && sellerComplete) {
    redirect(nextPath);
  }

  const initialRole: AccountType = wantsSeller || profile?.account_type === "seller" ? "seller" : "buyer";

  return (
    <main className="min-h-screen bg-[#f7f2e8] text-[#171717] font-[family-name:var(--font-inter)]">
      <div className="mx-auto flex w-full max-w-[86rem] flex-col gap-8 px-5 py-8 sm:px-8 lg:px-12">
        <nav className="border-b border-[#171717]/15 pb-5">
          <Link href="/marketplace" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#171717]/20 bg-white/55 px-4 text-xs font-bold uppercase tracking-[0.16em] transition hover:border-[#171717]">
            <span aria-hidden="true">←</span>
            Marketplace
          </Link>
        </nav>

        <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.26em] text-[#0f766e]">Marketplace access</p>
            <h1 className="font-[family-name:var(--font-instrument-serif)] text-[clamp(3rem,7vw,7rem)] font-semibold uppercase leading-[0.82]">
              Choose your role
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#4b4b45]">
              Buyers enter the catalog immediately. Sellers verify their Bambu Lab printer setup, location, and material rates before listing models.
            </p>
          </div>
          <div className="rounded-md border border-[#171717]/15 bg-white/65 p-5">
            <p className="text-sm font-semibold">Signed in as</p>
            <p className="mt-2 break-words text-sm leading-6 text-[#686861]">{userData.user.email || userData.user.id}</p>
          </div>
        </header>

        <MarketplaceOnboardingForm
          initialRole={initialRole}
          initialSellerProfile={sellerProfile || null}
          nextPath={nextPath}
        />
      </div>
    </main>
  );
}
