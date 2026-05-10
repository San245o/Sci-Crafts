import type { SupabaseClient } from "@supabase/supabase-js";
import { displayNameForOwner, getProfilesById } from "./sellers";
import type {
  ConversationMessageRecord,
  ConversationRecord,
  ConversationSummary,
  ConversationThread,
} from "./conversations";

type ProductPreview = {
  id: string;
  title: string;
};

export async function getConversationSummaries(supabase: SupabaseClient, userId: string) {
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("id, product_id, buyer_id, seller_id, created_at, updated_at")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("updated_at", { ascending: false })
    .returns<ConversationRecord[]>();

  if (error) {
    return { conversations: [] as ConversationSummary[], error };
  }

  const conversationList = conversations || [];
  if (conversationList.length === 0) {
    return { conversations: [] as ConversationSummary[], error: null };
  }

  const [profiles, productsResult, messagesResult] = await Promise.all([
    getProfilesById(supabase, conversationList.flatMap((conversation) => [conversation.buyer_id, conversation.seller_id])),
    supabase
      .from("products")
      .select("id, title")
      .in("id", conversationList.map((conversation) => conversation.product_id))
      .returns<ProductPreview[]>(),
    supabase
      .from("conversation_messages")
      .select("id, conversation_id, sender_id, body, created_at")
      .in("conversation_id", conversationList.map((conversation) => conversation.id))
      .order("created_at", { ascending: false })
      .returns<ConversationMessageRecord[]>(),
  ]);

  if (productsResult.error) {
    return { conversations: [] as ConversationSummary[], error: productsResult.error };
  }

  if (messagesResult.error) {
    return { conversations: [] as ConversationSummary[], error: messagesResult.error };
  }

  const productsById = new Map((productsResult.data || []).map((product) => [product.id, product]));
  const lastMessagesByConversation = new Map<string, ConversationMessageRecord>();

  for (const message of messagesResult.data || []) {
    if (!lastMessagesByConversation.has(message.conversation_id)) {
      lastMessagesByConversation.set(message.conversation_id, message);
    }
  }

  return {
    conversations: conversationList.map((conversation): ConversationSummary => {
      const isBuyer = conversation.buyer_id === userId;
      const otherRole: ConversationSummary["otherRole"] = isBuyer ? "seller" : "buyer";
      return {
        ...conversation,
        productTitle: productsById.get(conversation.product_id)?.title || "Marketplace product",
        productPath: `/marketplace/${conversation.product_id}`,
        buyerName: displayNameForOwner(profiles, conversation.buyer_id),
        sellerName: displayNameForOwner(profiles, conversation.seller_id),
        otherName: displayNameForOwner(profiles, isBuyer ? conversation.seller_id : conversation.buyer_id),
        otherRole,
        lastMessage: lastMessagesByConversation.get(conversation.id) || null,
      };
    }),
    error: null,
  };
}

export async function getConversationThread(supabase: SupabaseClient, conversationId: string) {
  const { data: conversation, error } = await supabase
    .from("conversations")
    .select("id, product_id, buyer_id, seller_id, created_at, updated_at")
    .eq("id", conversationId)
    .maybeSingle<ConversationRecord>();

  if (error || !conversation) {
    return { thread: null as ConversationThread | null, error };
  }

  const [profiles, productResult, messagesResult] = await Promise.all([
    getProfilesById(supabase, [conversation.buyer_id, conversation.seller_id]),
    supabase
      .from("products")
      .select("id, title")
      .eq("id", conversation.product_id)
      .maybeSingle<ProductPreview>(),
    supabase
      .from("conversation_messages")
      .select("id, conversation_id, sender_id, body, created_at")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true })
      .returns<ConversationMessageRecord[]>(),
  ]);

  if (productResult.error) {
    return { thread: null as ConversationThread | null, error: productResult.error };
  }

  if (messagesResult.error) {
    return { thread: null as ConversationThread | null, error: messagesResult.error };
  }

  return {
    thread: {
      ...conversation,
      productTitle: productResult.data?.title || "Marketplace product",
      productPath: `/marketplace/${conversation.product_id}`,
      buyerName: displayNameForOwner(profiles, conversation.buyer_id),
      sellerName: displayNameForOwner(profiles, conversation.seller_id),
      messages: messagesResult.data || [],
    },
    error: null,
  };
}
