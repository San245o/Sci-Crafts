"use client";

import Link from "next/link";
import { useState } from "react";
import type { ConversationSummary } from "@/lib/marketplace/conversations";
import { ConversationThread } from "../ConversationThread";

type InboxClientProps = {
  initialConversations: ConversationSummary[];
};

type ConversationsResponse = {
  conversations?: ConversationSummary[];
  error?: string;
};

function formatInboxTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function InboxClient({ initialConversations }: InboxClientProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState(initialConversations[0]?.id || null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  async function refreshConversations() {
    setLoading(true);
    setNotice("");
    const response = await fetch("/api/conversations", { cache: "no-store" });
    const result = await response.json().catch(() => ({})) as ConversationsResponse;
    setLoading(false);

    if (!response.ok || !result.conversations) {
      setNotice(result.error || "Could not refresh inbox.");
      return;
    }

    setConversations(result.conversations);
    if (selectedId && !result.conversations.some((conversation) => conversation.id === selectedId)) {
      setSelectedId(result.conversations[0]?.id || null);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-12rem)] gap-5 lg:grid-cols-[24rem_minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col rounded-md border border-[#171717]/15 bg-white/65">
        <div className="flex items-center justify-between gap-3 border-b border-[#171717]/15 p-4">
          <div>
            <p className="text-lg font-semibold">Inbox</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[#686861]">
              {conversations.length} thread{conversations.length === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            onClick={refreshConversations}
            disabled={loading}
            className="min-h-10 rounded-full border border-[#171717]/20 bg-white px-4 text-xs font-bold uppercase tracking-[0.14em] transition hover:border-[#171717] disabled:cursor-wait disabled:opacity-50"
          >
            {loading ? "..." : "Refresh"}
          </button>
        </div>

        {notice ? <p className="mx-4 mt-4 rounded-md border border-[#d92d20]/25 bg-[#fff4f2] px-3 py-2 text-sm font-semibold text-[#b42318]">{notice}</p> : null}

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {conversations.map((conversation) => {
            const selected = conversation.id === selectedId;
            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setSelectedId(conversation.id)}
                className={`mb-2 grid w-full gap-2 rounded-md border p-4 text-left transition ${selected ? "border-[#0f766e] bg-[#e6f4ef]" : "border-[#171717]/15 bg-white/70 hover:border-[#171717]/35"}`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{conversation.otherName}</span>
                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#0f766e]">
                      {conversation.otherRole}
                    </span>
                  </span>
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] text-[#686861]">
                    {formatInboxTime(conversation.updated_at)}
                  </span>
                </span>
                <span className="truncate text-xs font-bold uppercase tracking-[0.14em] text-[#686861]">
                  {conversation.productTitle}
                </span>
                <span className="line-clamp-2 text-sm leading-6 text-[#4b4b45]">
                  {conversation.lastMessage?.body || "No messages yet."}
                </span>
              </button>
            );
          })}

          {conversations.length === 0 ? (
            <div className="grid gap-3 rounded-md border border-dashed border-[#171717]/20 bg-[#f7f2e8] px-4 py-10 text-center">
              <p className="text-sm font-semibold">No conversations yet.</p>
              <Link href="/marketplace" className="text-xs font-bold uppercase tracking-[0.16em] text-[#d92d20]">
                Browse marketplace
              </Link>
            </div>
          ) : null}
        </div>
      </aside>

      <ConversationThread conversationId={selectedId} emptyTitle="No conversation selected" />
    </div>
  );
}
