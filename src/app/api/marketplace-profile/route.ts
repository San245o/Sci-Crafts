import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  isMarketplaceCity,
  normalizeSellerPrinters,
  toPublicSellerPrinters,
  type AccountType,
} from "@/lib/marketplace/seller-profile";

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function safeNextPath(value: unknown) {
  const next = stringValue(value);
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/marketplace";
  return next;
}

function profileName(user: User) {
  const metadata = user.user_metadata;
  const name =
    typeof metadata?.full_name === "string" ? metadata.full_name :
    typeof metadata?.name === "string" ? metadata.name :
    typeof user.email === "string" ? user.email.split("@")[0] :
    `User ${user.id.slice(0, 8)}`;

  return name.slice(0, 120);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json({ error: "Sign in before choosing a marketplace role." }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const accountType = body?.accountType === "seller" ? "seller" : body?.accountType === "buyer" ? "buyer" : null;
  const nextPath = safeNextPath(body?.nextPath);

  if (!accountType) {
    return NextResponse.json({ error: "Choose buyer or seller." }, { status: 400 });
  }

  const user = userData.user;
  const avatarUrl = typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null;
  const profilePayload: { id: string; display_name: string; avatar_url: string | null; account_type: AccountType } = {
    id: user.id,
    display_name: profileName(user),
    avatar_url: avatarUrl,
    account_type: accountType,
  };

  const profileUpdate = await supabase.from("profiles").upsert(profilePayload);
  if (profileUpdate.error) {
    return NextResponse.json({ error: profileUpdate.error.message }, { status: 500 });
  }

  if (accountType === "buyer") {
    const [deleteSellerProfile, deleteAvailability] = await Promise.all([
      supabase.from("seller_profiles").delete().eq("id", user.id),
      supabase.from("seller_availability").delete().eq("id", user.id),
    ]);

    if (deleteSellerProfile.error || deleteAvailability.error) {
      return NextResponse.json({ error: deleteSellerProfile.error?.message || deleteAvailability.error?.message }, { status: 500 });
    }

    return NextResponse.json({ next: nextPath === "/marketplace/new" ? "/marketplace" : nextPath });
  }

  const city = stringValue(body?.city);
  const pincode = stringValue(body?.pincode);
  const location = stringValue(body?.location);
  const { printers, error } = normalizeSellerPrinters(body?.sellerPrinters);

  if (!city || !isMarketplaceCity(city)) {
    return NextResponse.json({ error: "Choose one of the supported marketplace cities." }, { status: 400 });
  }

  if (!/^[0-9]{6}$/.test(pincode)) {
    return NextResponse.json({ error: "Pincode must be 6 digits." }, { status: 400 });
  }

  if (!location || location.length > 240) {
    return NextResponse.json({ error: "Location is required." }, { status: 400 });
  }

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const sellerProfileUpdate = await supabase.from("seller_profiles").upsert({
    id: user.id,
    city,
    pincode,
    location,
    printers,
  });

  if (sellerProfileUpdate.error) {
    return NextResponse.json({ error: sellerProfileUpdate.error.message }, { status: 500 });
  }

  const availabilityUpdate = await supabase.from("seller_availability").upsert({
    id: user.id,
    city,
    pincode,
    location,
    printers: toPublicSellerPrinters(printers),
  });

  if (availabilityUpdate.error) {
    return NextResponse.json({ error: availabilityUpdate.error.message }, { status: 500 });
  }

  return NextResponse.json({ next: nextPath });
}
