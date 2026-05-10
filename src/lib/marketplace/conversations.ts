export type ConversationRecord = {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
};

export type ConversationMessageRecord = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type ConversationSummary = ConversationRecord & {
  productTitle: string;
  productPath: string;
  buyerName: string;
  sellerName: string;
  otherName: string;
  otherRole: "buyer" | "seller";
  lastMessage: ConversationMessageRecord | null;
};

export type ConversationThread = ConversationRecord & {
  productTitle: string;
  productPath: string;
  buyerName: string;
  sellerName: string;
  messages: ConversationMessageRecord[];
};
