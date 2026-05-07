"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function NewProductForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

    setMessage("Upload complete. Your model is queued for optimization.");
    router.push(`/marketplace/${result.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="max-w-xl space-y-4">
      <label className="block text-sm">
        Title
        <input name="title" required maxLength={120} className="mt-1 w-full border border-black px-3 py-2" />
      </label>

      <label className="block text-sm">
        Description
        <textarea name="description" required rows={5} className="mt-1 w-full border border-black px-3 py-2" />
      </label>

      <label className="block text-sm">
        Price in INR
        <input name="price" required min="0" step="1" type="number" className="mt-1 w-full border border-black px-3 py-2" />
      </label>

      <label className="block text-sm">
        Category
        <input name="category" required maxLength={80} className="mt-1 w-full border border-black px-3 py-2" />
      </label>

      <label className="block text-sm">
        Images
        <input name="images" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="mt-1 block w-full" />
      </label>

      <label className="block text-sm">
        GLB model, max 15 MB
        <input name="model" type="file" accept=".glb,model/gltf-binary" required className="mt-1 block w-full" />
      </label>

      <button disabled={loading} className="border border-black bg-black px-4 py-2 text-white disabled:opacity-50">
        {loading ? "Uploading..." : "Upload model"}
      </button>

      {message ? <p className="text-sm">{message}</p> : null}
    </form>
  );
}
