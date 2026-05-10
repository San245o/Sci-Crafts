import { NextResponse } from "next/server";
import { getConversationSummaries } from "@/lib/marketplace/conversation-data";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

export async function GET() {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json({ error: "Sign in before viewing conversations." }, { status: 401 });
  }

  const { conversations, error } = await getConversationSummaries(supabase, userData.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ conversations, currentUserId: userData.user.id });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json({ error: "Sign in before contacting a seller." }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const productId = stringValue(body?.productId);
  const sellerId = stringValue(body?.sellerId);
  const requestedMessage = stringValue(body?.message);

  if (!isUuid(productId) || !isUuid(sellerId)) {
    return NextResponse.json({ error: "Product and seller are required." }, { status: 400 });
  }

  if (sellerId === userData.user.id) {
    return NextResponse.json({ error: "You cannot contact your own seller profile." }, { status: 400 });
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, title")
    .eq("id", productId)
    .eq("is_published", true)
    .maybeSingle<{ id: string; title: string }>();

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 500 });
  }

  if (!product) {
    return NextResponse.json({ error: "Product is not available." }, { status: 404 });
  }

  const { data: seller, error: sellerError } = await supabase
    .from("seller_availability")
    .select("id")
    .eq("id", sellerId)
    .maybeSingle<{ id: string }>();

  if (sellerError) {
    return NextResponse.json({ error: sellerError.message }, { status: 500 });
  }

  if (!seller) {
    return NextResponse.json({ error: "Seller is not available." }, { status: 404 });
  }

  const { data: existingConversation, error: existingConversationError } = await supabase
    .from("conversations")
    .select("id")
    .eq("product_id", productId)
    .eq("buyer_id", userData.user.id)
    .eq("seller_id", sellerId)
    .maybeSingle<{ id: string }>();

  if (existingConversationError) {
    return NextResponse.json({ error: existingConversationError.message }, { status: 500 });
  }

  let conversationId = existingConversation?.id;
  let createdConversation = false;

  if (!conversationId) {
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({
        product_id: productId,
        buyer_id: userData.user.id,
        seller_id: sellerId,
      })
      .select("id")
      .single<{ id: string }>();

    if (conversationError) {
      return NextResponse.json({ error: conversationError.message }, { status: 500 });
    }

    conversationId = conversation.id;
    createdConversation = true;
  }

  const message = requestedMessage || `Hi, I am interested in ${product.title}: /marketplace/${product.id}`;
  if (createdConversation || requestedMessage) {
    const { error: messageError } = await supabase
      .from("conversation_messages")
      .insert({
        conversation_id: conversationId,
        sender_id: userData.user.id,
        body: message.slice(0, 2000),
      });

    if (messageError) {
      return NextResponse.json({ error: messageError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ id: conversationId });
}
