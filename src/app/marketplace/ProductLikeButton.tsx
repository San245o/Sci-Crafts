"use client";

import { MouseEvent, useState } from "react";
import { useRouter } from "next/navigation";

type ProductLikeButtonProps = {
  productId: string;
  initialLiked: boolean;
};

export function ProductLikeButton({ productId, initialLiked }: ProductLikeButtonProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  async function toggleLike(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    const nextLiked = !liked;
    setLiked(nextLiked);
    setLoading(true);

    const response = await fetch("/api/product-likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, liked: nextLiked }),
    });
    const result = await response.json().catch(() => ({})) as { liked?: boolean };
    setLoading(false);

    if (response.status === 401) {
      setLiked(liked);
      router.push(`/login?next=${encodeURIComponent("/marketplace")}`);
      return;
    }

    if (!response.ok || typeof result.liked !== "boolean") {
      setLiked(liked);
      return;
    }

    setLiked(result.liked);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggleLike}
      disabled={loading}
      aria-pressed={liked}
      aria-label={liked ? "Remove like" : "Like model"}
      className={`flex h-10 min-w-16 items-center justify-center rounded-full border px-3 text-[10px] font-bold uppercase tracking-[0.14em] shadow-sm backdrop-blur transition disabled:cursor-wait disabled:opacity-60 ${liked ? "border-[#d92d20] bg-[#d92d20] text-white" : "border-[#171717]/15 bg-white/85 text-[#171717] hover:border-[#d92d20] hover:text-[#d92d20]"}`}
    >
      {liked ? "Liked" : "Like"}
    </button>
  );
}
