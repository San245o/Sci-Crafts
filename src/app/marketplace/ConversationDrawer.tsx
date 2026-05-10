"use client";

import { ConversationThread } from "./ConversationThread";

type ConversationDrawerProps = {
  conversationId: string | null;
  onClose: () => void;
};

export function ConversationDrawer({ conversationId, onClose }: ConversationDrawerProps) {
  if (!conversationId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#171717]/35 px-3 py-4 backdrop-blur-sm sm:px-5">
      <div className="ml-auto flex h-full w-full max-w-2xl flex-col rounded-md border border-[#171717]/15 bg-[#f7f2e8] shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-[#171717]/15 px-4 py-3">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#171717]">Seller chat</p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#171717]/20 bg-white/70 text-lg font-semibold transition hover:border-[#171717]"
            aria-label="Close chat"
          >
            x
          </button>
        </div>
        <div className="min-h-0 flex-1 p-3 sm:p-4">
          <ConversationThread conversationId={conversationId} />
        </div>
      </div>
    </div>
  );
}
