import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json({ error: "Sign in before liking models." }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const productId = stringValue(body?.productId);
  const liked = body?.liked === true;

  if (!isUuid(productId)) {
    return NextResponse.json({ error: "Product is required." }, { status: 400 });
  }

  if (liked) {
    const { error } = await supabase
      .from("product_likes")
      .insert({
        product_id: productId,
        user_id: userData.user.id,
      });

    if (error && error.code !== "23505") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ liked: true });
  }

  const { error } = await supabase
    .from("product_likes")
    .delete()
    .eq("product_id", productId)
    .eq("user_id", userData.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ liked: false });
}
