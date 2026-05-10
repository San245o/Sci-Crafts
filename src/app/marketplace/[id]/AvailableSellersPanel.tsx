"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ConversationDrawer } from "@/app/marketplace/ConversationDrawer";
import {
  MATERIAL_LABELS,
  getPrinterName,
  materialSummary,
  printerSummary,
  type SellerAvailability,
} from "@/lib/marketplace/seller-profile";
import { availabilityCities, sellerStartingPrice, sortSellerAvailability } from "@/lib/marketplace/seller-availability";

export type SellerAvailabilityView = SellerAvailability & {
  sellerName: string;
};

type AvailableSellersPanelProps = {
  productId: string;
  sellers: SellerAvailabilityView[];
};

export function AvailableSellersPanel({ productId, sellers }: AvailableSellersPanelProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [city, setCity] = useState("");
  const [contactingSellerId, setContactingSellerId] = useState<string | null>(null);
  const [contactNotice, setContactNotice] = useState<{ sellerId: string; message: string } | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const cities = useMemo(() => availabilityCities(sellers), [sellers]);
  const sortedSellers = useMemo(() => sortSellerAvailability(sellers, city), [sellers, city]);

  async function contactSeller(seller: SellerAvailabilityView) {
    setContactingSellerId(seller.id);
    setContactNotice(null);

    try {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push(`/login?next=${encodeURIComponent(`/marketplace/${productId}`)}`);
        return;
      }

      if (data.user.id === seller.id) {
        setContactNotice({ sellerId: seller.id, message: "This is your seller profile." });
        return;
      }

      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          sellerId: seller.id,
        }),
      });
      const result = await response.json().catch(() => ({})) as { id?: string; error?: string };

      if (!response.ok || !result.id) {
        setContactNotice({ sellerId: seller.id, message: result.error || "Could not contact seller." });
        return;
      }

      setActiveConversationId(result.id);
      setContactNotice({ sellerId: seller.id, message: "Chat opened." });
    } catch {
      setContactNotice({ sellerId: seller.id, message: "Could not contact seller." });
    } finally {
      setContactingSellerId(null);
    }
  }

  return (
    <>
    <section className="grid gap-4 rounded-md border border-[#171717]/15 bg-white/65 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Available sellers</h2>
          <p className="mt-1 text-sm leading-6 text-[#686861]">
            {sellers.length} seller{sellers.length === 1 ? "" : "s"} can print this model. Select a city to bring local sellers to the top.
          </p>
        </div>
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#686861]">
          Show sellers in
          <select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="min-h-11 rounded-md border border-[#171717]/15 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-[#171717] outline-none transition focus:border-[#0f766e]"
          >
            <option value="">All cities</option>
            {cities.map((cityName) => (
              <option key={cityName} value={cityName}>{cityName}</option>
            ))}
          </select>
        </label>
      </div>

      {sortedSellers.length ? (
        <div className="grid gap-3">
          {sortedSellers.map((seller) => {
            const startingPrice = sellerStartingPrice(seller);
            return (
              <article id={`seller-${seller.id}`} key={seller.id} className={`grid gap-4 rounded-md border p-4 ${city && seller.city === city ? "border-[#0f766e] bg-[#e6f4ef]" : "border-[#171717]/15 bg-[#f7f2e8]"}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{seller.sellerName}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#686861]">{seller.location}, {seller.city} {seller.pincode}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold">{seller.rating.toFixed(1)} rating</p>
                    <p className="mt-1 text-xs text-[#686861]">{seller.rating_count} review{seller.rating_count === 1 ? "" : "s"}</p>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="grid gap-1 text-sm">
                    <p><span className="font-semibold">Printers:</span> {printerSummary(seller.printers)}</p>
                    <p><span className="font-semibold">Plastics:</span> {materialSummary(seller.printers)}</p>
                    <p><span className="font-semibold">Starting:</span> {startingPrice ? `INR ${startingPrice}/g` : "Pricing not set"}</p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => contactSeller(seller)}
                      disabled={contactingSellerId === seller.id}
                      className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0f766e] px-5 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#115e59] disabled:cursor-wait disabled:opacity-55"
                    >
                      {contactingSellerId === seller.id ? "Checking" : "Contact seller"}
                    </button>
                    {contactNotice?.sellerId === seller.id ? (
                      <p className="text-xs font-semibold leading-5 text-[#0f766e]">{contactNotice.message}</p>
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    {seller.printers.map((printer, index) => (
                      <div key={`${printer.printerModel}-${index}`} className="rounded-md border border-[#171717]/10 bg-white/70 p-3">
                        <p className="text-sm font-semibold">{getPrinterName(printer.printerModel)}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {printer.materialRates.map((rate) => (
                            <span key={`${printer.printerModel}-${rate.material}`} className="rounded-full bg-[#f7f2e8] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#686861]">
                              {MATERIAL_LABELS[rate.material]} - INR {rate.pricePerGram}/g
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-[#171717]/25 bg-[#f7f2e8] px-4 py-8 text-center text-sm leading-6 text-[#686861]">
          No verified sellers are available yet.
        </div>
      )}
    </section>
    <ConversationDrawer conversationId={activeConversationId} onClose={() => setActiveConversationId(null)} />
    </>
  );
}
