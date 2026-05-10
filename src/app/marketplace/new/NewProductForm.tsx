"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function NewProductForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageCount, setImageCount] = useState(0);
  const [modelName, setModelName] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const form = event.currentTarget;
    const response = await fetch("/api/products", {
      method: "POST",
      body: new FormData(form),
    });

    const result = (await response.json()) as { id?: string; error?: string };
    setLoading(false);

    if (!response.ok || !result.id) {
      setMessage(result.error || "Upload failed.");
      return;
    }

    setMessage("Upload complete. GLB files are queued for optimization; ZIP packages are ready for download.");
    router.push(`/marketplace/${result.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-6 rounded-md border border-[#171717]/15 bg-white/65 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="grid gap-5">
        <label className="grid gap-2 text-sm font-semibold">
          Title
          <input name="title" required maxLength={120} placeholder="Geometric desk organizer" className="min-h-12 rounded-md border border-[#171717]/15 bg-white px-4 outline-none transition placeholder:text-[#9b968d] focus:border-[#0f766e]" />
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Description
          <textarea name="description" required rows={6} placeholder="Describe print settings, use cases, assembly notes, or included parts." className="rounded-md border border-[#171717]/15 bg-white px-4 py-3 outline-none transition placeholder:text-[#9b968d] focus:border-[#0f766e]" />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            Price in INR
            <input name="price" required min="0" step="1" type="number" placeholder="499" className="min-h-12 rounded-md border border-[#171717]/15 bg-white px-4 outline-none transition placeholder:text-[#9b968d] focus:border-[#0f766e]" />
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            Category
            <input name="category" required maxLength={80} placeholder="Desk tools" className="min-h-12 rounded-md border border-[#171717]/15 bg-white px-4 outline-none transition placeholder:text-[#9b968d] focus:border-[#0f766e]" />
          </label>
        </div>
      </div>

      <aside className="grid content-start gap-4">
        <label className="grid min-h-36 cursor-pointer place-items-center rounded-md border border-dashed border-[#171717]/25 bg-[#f7f2e8] px-4 py-6 text-center transition hover:border-[#0f766e]">
          <span className="text-sm font-semibold">Product images</span>
          <span className="mt-2 text-xs leading-5 text-[#686861]">{imageCount ? `${imageCount} image${imageCount === 1 ? "" : "s"} selected` : "JPG, PNG, WEBP, or GIF"}</span>
          <input
            name="images"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="sr-only"
            onChange={(event) => setImageCount(event.currentTarget.files?.length || 0)}
          />
        </label>

        <label className="grid min-h-36 cursor-pointer place-items-center rounded-md border border-dashed border-[#171717]/25 bg-[#f7f2e8] px-4 py-6 text-center transition hover:border-[#0f766e]">
          <span className="text-sm font-semibold">Model file</span>
          <span className="mt-2 max-w-full truncate text-xs leading-5 text-[#686861]">{modelName || "GLB preview file or ZIP CAD/STL package, max 15 MB"}</span>
          <input
            name="model"
            type="file"
            accept=".glb,.zip,model/gltf-binary,application/zip,application/x-zip-compressed"
            required
            className="sr-only"
            onChange={(event) => setModelName(event.currentTarget.files?.[0]?.name || "")}
          />
        </label>

        <button disabled={loading} className="min-h-12 rounded-full bg-[#d92d20] px-6 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#b42318] disabled:cursor-wait disabled:opacity-50">
          {loading ? "Uploading" : "Upload model"}
        </button>

        {message ? <p className="rounded-md border border-[#0f766e]/25 bg-[#ecfdf5] px-4 py-3 text-sm font-semibold text-[#0f766e]">{message}</p> : null}
      </aside>
    </form>
  );
}
