"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ConversationThread as ConversationThreadData } from "@/lib/marketplace/conversations";

type ConversationThreadProps = {
  conversationId: string | null;
  emptyTitle?: string;
};

type ThreadResponse = {
  thread?: ConversationThreadData;
  currentUserId?: string;
  error?: string;
};

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function MessageBody({ body }: { body: string }) {
  const productPathMatch = body.match(/\/marketplace\/[0-9a-f-]+/i);

  if (!productPathMatch?.index) {
    if (productPathMatch?.[0]) {
      return (
        <>
          <Link href={productPathMatch[0]} className="font-semibold underline underline-offset-2">View product</Link>
          <span>{body.slice(productPathMatch[0].length)}</span>
        </>
      );
    }

    return <>{body}</>;
  }

  const productPath = productPathMatch[0];
  const before = body.slice(0, productPathMatch.index);
  const after = body.slice(productPathMatch.index + productPath.length);

  return (
    <>
      <span>{before}</span>
      <Link href={productPath} className="font-semibold underline underline-offset-2">View product</Link>
      <span>{after}</span>
    </>
  );
}

export function ConversationThread({ conversationId, emptyTitle = "Select a conversation" }: ConversationThreadProps) {
  const [thread, setThread] = useState<ConversationThreadData | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadThread = useCallback(async (showLoading = false) => {
    if (!conversationId) {
      setThread(null);
      setCurrentUserId("");
      return;
    }

    if (showLoading) setLoading(true);
    const response = await fetch(`/api/conversations/${conversationId}/messages`, { cache: "no-store" });
    const result = await response.json().catch(() => ({})) as ThreadResponse;
    if (showLoading) setLoading(false);

    if (!response.ok || !result.thread || !result.currentUserId) {
      setNotice(result.error || "Could not load messages.");
      return;
    }

    setThread(result.thread);
    setCurrentUserId(result.currentUserId);
    setNotice("");
  }, [conversationId]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadThread(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loadThread]);

  useEffect(() => {
    if (!conversationId) return;

    const interval = window.setInterval(() => {
      void loadThread(false);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [conversationId, loadThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [thread?.messages.length]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!conversationId || !message.trim()) return;

    setSending(true);
    setNotice("");
    const response = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message.trim() }),
    });
    const result = await response.json().catch(() => ({})) as ThreadResponse;
    setSending(false);

    if (!response.ok || !result.thread || !result.currentUserId) {
      setNotice(result.error || "Could not send message.");
      return;
    }

    setMessage("");
    setThread(result.thread);
    setCurrentUserId(result.currentUserId);
  }

  if (!conversationId) {
    return (
      <div className="grid min-h-[26rem] place-items-center rounded-md border border-dashed border-[#171717]/20 bg-white/45 px-5 text-center">
        <div>
          <p className="text-lg font-semibold">{emptyTitle}</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[#686861]">Choose a buyer or seller thread to continue the conversation.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex min-h-[30rem] flex-col overflow-hidden rounded-md border border-[#171717]/15 bg-white/75">
      <header className="border-b border-[#171717]/15 px-4 py-4">
        {thread ? (
          <Link href={thread.productPath} className="block truncate text-sm font-bold uppercase tracking-[0.16em] text-[#0f766e] transition hover:text-[#d92d20]">
            {thread.productTitle}
          </Link>
        ) : (
          <p className="truncate text-sm font-bold uppercase tracking-[0.16em] text-[#0f766e]">
            {loading ? "Loading" : "Conversation"}
          </p>
        )}
        {thread ? (
          <p className="mt-1 truncate text-sm text-[#686861]">
            Buyer: {thread.buyerName} - Seller: {thread.sellerName}
          </p>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-[#f7f2e8]/70 px-4 py-4">
        {loading ? (
          <p className="text-sm font-semibold text-[#686861]">Loading messages...</p>
        ) : null}

        {thread?.messages.map((item) => {
          const isOwnMessage = item.sender_id === currentUserId;
          return (
            <div key={item.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[82%] rounded-md px-4 py-3 ${isOwnMessage ? "bg-[#0f766e] text-white" : "bg-white text-[#171717] border border-[#171717]/10"}`}>
                <p className="whitespace-pre-wrap text-sm leading-6"><MessageBody body={item.body} /></p>
                <p className={`mt-2 text-[10px] font-bold uppercase tracking-[0.14em] ${isOwnMessage ? "text-white/70" : "text-[#686861]"}`}>
                  {formatMessageTime(item.created_at)}
                </p>
              </div>
            </div>
          );
        })}

        {!loading && thread?.messages.length === 0 ? (
          <p className="rounded-md border border-dashed border-[#171717]/20 bg-white/55 px-4 py-8 text-center text-sm text-[#686861]">
            No messages yet.
          </p>
        ) : null}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="grid gap-3 border-t border-[#171717]/15 bg-white/85 p-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label className="sr-only" htmlFor={`message-${conversationId}`}>Message</label>
        <textarea
          id={`message-${conversationId}`}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={2000}
          rows={2}
          placeholder="Type a message"
          className="min-h-12 resize-none rounded-md border border-[#171717]/15 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#9b968d] focus:border-[#0f766e]"
        />
        <button
          disabled={sending || !message.trim()}
          className="min-h-12 rounded-full bg-[#d92d20] px-6 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#b42318] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? "Sending" : "Send"}
        </button>
        {notice ? <p className="text-sm font-semibold text-[#b42318] sm:col-span-2">{notice}</p> : null}
      </form>
    </section>
  );
}
