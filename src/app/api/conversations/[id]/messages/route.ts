import { NextResponse } from "next/server";
import { getConversationThread } from "@/lib/marketplace/conversation-data";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RouteProps = {
  params: Promise<{ id: string }>;
};

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

export async function GET(_request: Request, { params }: RouteProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json({ error: "Sign in before viewing messages." }, { status: 401 });
  }

  if (!isUuid(id)) {
    return NextResponse.json({ error: "Conversation is required." }, { status: 400 });
  }

  const { thread, error } = await getConversationThread(supabase, id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!thread) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  return NextResponse.json({ thread, currentUserId: userData.user.id });
}

export async function POST(request: Request, { params }: RouteProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json({ error: "Sign in before sending messages." }, { status: 401 });
  }

  if (!isUuid(id)) {
    return NextResponse.json({ error: "Conversation is required." }, { status: 400 });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const message = stringValue(body?.message);

  if (!message) {
    return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
  }

  if (message.length > 2000) {
    return NextResponse.json({ error: "Message must be 2000 characters or fewer." }, { status: 400 });
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", id)
    .maybeSingle<{ id: string }>();

  if (conversationError) {
    return NextResponse.json({ error: conversationError.message }, { status: 500 });
  }

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  const { error: messageError } = await supabase
    .from("conversation_messages")
    .insert({
      conversation_id: id,
      sender_id: userData.user.id,
      body: message,
    });

  if (messageError) {
    return NextResponse.json({ error: messageError.message }, { status: 500 });
  }

  const { thread, error } = await getConversationThread(supabase, id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ thread, currentUserId: userData.user.id });
}
