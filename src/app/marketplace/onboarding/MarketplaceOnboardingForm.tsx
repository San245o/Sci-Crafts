"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BAMBU_PRINTERS,
  MATERIAL_LABELS,
  TOP_MARKETPLACE_CITIES,
  getSupportedMaterials,
  materialSummary,
  printerSummary,
  type AccountType,
  type MaterialId,
  type PrinterModelId,
  type SellerPrinter,
  type SellerProfile,
} from "@/lib/marketplace/seller-profile";

type PrinterFormState = {
  key: string;
  printerModel: PrinterModelId;
  serialNumber: string;
  selectedMaterials: MaterialId[];
  prices: Partial<Record<MaterialId, string>>;
};

type MarketplaceOnboardingFormProps = {
  initialRole: AccountType;
  initialSellerProfile: SellerProfile | null;
  nextPath: string;
};

function stateKey() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
}

function emptyPrinterState(printerModel: PrinterModelId = BAMBU_PRINTERS[0].id): PrinterFormState {
  return {
    key: stateKey(),
    printerModel,
    serialNumber: "",
    selectedMaterials: [],
    prices: {},
  };
}

function toPrinterState(printer: SellerPrinter, index: number): PrinterFormState {
  return {
    key: `${printer.printerModel}-${index}`,
    printerModel: printer.printerModel,
    serialNumber: printer.serialNumber,
    selectedMaterials: printer.materialRates.map((rate) => rate.material),
    prices: Object.fromEntries(printer.materialRates.map((rate) => [rate.material, String(rate.pricePerGram)])),
  };
}

export function MarketplaceOnboardingForm({ initialRole, initialSellerProfile, nextPath }: MarketplaceOnboardingFormProps) {
  const router = useRouter();
  const [role, setRole] = useState<AccountType>(initialRole);
  const [city, setCity] = useState(initialSellerProfile?.city || "");
  const [pincode, setPincode] = useState(initialSellerProfile?.pincode || "");
  const [location, setLocation] = useState(initialSellerProfile?.location || "");
  const [printers, setPrinters] = useState<PrinterFormState[]>(
    initialSellerProfile?.printers?.length ? initialSellerProfile.printers.map(toPrinterState) : [emptyPrinterState()],
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const summaryPrinters = useMemo(() => {
    return printers.map((printer) => ({
      printerModel: printer.printerModel,
      materialRates: printer.selectedMaterials.map((material) => ({
        material,
        pricePerGram: Number(printer.prices[material]),
      })),
    }));
  }, [printers]);

  function updatePrinter(index: number, nextPrinter: PrinterFormState) {
    setPrinters((current) => current.map((printer, printerIndex) => printerIndex === index ? nextPrinter : printer));
  }

  function changePrinterModel(index: number, printerModel: PrinterModelId) {
    const supported = new Set(getSupportedMaterials(printerModel));
    const current = printers[index];
    updatePrinter(index, {
      ...current,
      printerModel,
      selectedMaterials: current.selectedMaterials.filter((material) => supported.has(material)),
      prices: Object.fromEntries(
        Object.entries(current.prices).filter(([material]) => supported.has(material as MaterialId)),
      ) as Partial<Record<MaterialId, string>>,
    });
  }

  function toggleMaterial(index: number, material: MaterialId) {
    const current = printers[index];
    const selectedMaterials = current.selectedMaterials.includes(material)
      ? current.selectedMaterials.filter((item) => item !== material)
      : [...current.selectedMaterials, material];

    updatePrinter(index, { ...current, selectedMaterials });
  }

  function submitPayload() {
    if (role === "buyer") {
      return { accountType: role, nextPath };
    }

    return {
      accountType: role,
      city,
      pincode,
      location,
      nextPath,
      sellerPrinters: printers.map((printer) => ({
        printerModel: printer.printerModel,
        serialNumber: printer.serialNumber,
        materialRates: printer.selectedMaterials.map((material) => ({
          material,
          pricePerGram: Number(printer.prices[material]),
        })),
      })),
    };
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/marketplace-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submitPayload()),
    });

    const result = await response.json().catch(() => ({})) as { next?: string; error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(result.error || "Could not save marketplace profile.");
      return;
    }

    router.push(result.next || "/marketplace");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="grid gap-6 rounded-md border border-[#171717]/15 bg-white/65 p-5 sm:p-7">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setRole("buyer")}
            className={`min-h-24 rounded-md border px-5 text-left transition ${role === "buyer" ? "border-[#0f766e] bg-[#e6f4ef]" : "border-[#171717]/15 bg-white/60 hover:border-[#171717]"}`}
          >
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f766e]">Buyer</span>
            <span className="mt-2 block text-xl font-semibold">Browse and buy prints</span>
            <span className="mt-2 block text-sm leading-6 text-[#686861]">Use the standard marketplace catalog and product pages.</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("seller")}
            className={`min-h-24 rounded-md border px-5 text-left transition ${role === "seller" ? "border-[#d92d20] bg-[#fff4f2]" : "border-[#171717]/15 bg-white/60 hover:border-[#171717]"}`}
          >
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#d92d20]">Seller</span>
            <span className="mt-2 block text-xl font-semibold">List printable models</span>
            <span className="mt-2 block text-sm leading-6 text-[#686861]">Verify a supported Bambu Lab printer and INR per gram material rates.</span>
          </button>
        </div>

        {role === "seller" ? (
          <div className="grid gap-6 border-t border-[#171717]/15 pt-6">
            <div className="grid gap-5 sm:grid-cols-3">
              <label className="grid gap-2 text-sm font-semibold">
                City
                <select
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  required={role === "seller"}
                  className="min-h-12 rounded-md border border-[#171717]/15 bg-white px-4 outline-none transition focus:border-[#0f766e]"
                >
                  <option value="">Choose city</option>
                  {TOP_MARKETPLACE_CITIES.map((cityName) => (
                    <option key={cityName} value={cityName}>{cityName}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Pincode
                <input
                  value={pincode}
                  onChange={(event) => setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  required={role === "seller"}
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  placeholder="560001"
                  className="min-h-12 rounded-md border border-[#171717]/15 bg-white px-4 outline-none transition placeholder:text-[#9b968d] focus:border-[#0f766e]"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold sm:col-span-3">
                Location
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  required={role === "seller"}
                  maxLength={240}
                  placeholder="Area, landmark, or fulfillment location"
                  className="min-h-12 rounded-md border border-[#171717]/15 bg-white px-4 outline-none transition placeholder:text-[#9b968d] focus:border-[#0f766e]"
                />
              </label>
            </div>

            <div className="grid gap-4">
              <div>
                <div>
                  <h2 className="text-xl font-semibold">Printers and filament rates</h2>
                  <p className="mt-1 text-sm leading-6 text-[#686861]">Only the supported Bambu Lab models are available for this marketplace stage.</p>
                </div>
              </div>

              {printers.map((printer, index) => {
                const supportedMaterials = getSupportedMaterials(printer.printerModel);
                return (
                  <div key={printer.key} className="grid gap-3">
                    <div className="grid gap-4 rounded-md border border-[#171717]/15 bg-[#f7f2e8]/75 p-4">
                      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
                        <label className="grid gap-2 text-sm font-semibold">
                          Printer type
                          <select
                            value={printer.printerModel}
                            onChange={(event) => changePrinterModel(index, event.target.value as PrinterModelId)}
                            className="min-h-12 rounded-md border border-[#171717]/15 bg-white px-4 outline-none transition focus:border-[#0f766e]"
                          >
                            {BAMBU_PRINTERS.map((option) => (
                              <option key={option.id} value={option.id}>{option.name}</option>
                            ))}
                          </select>
                        </label>
                        <label className="grid gap-2 text-sm font-semibold">
                          Printer serial number
                          <input
                            value={printer.serialNumber}
                            onChange={(event) => updatePrinter(index, { ...printer, serialNumber: event.target.value })}
                            required={role === "seller"}
                            maxLength={120}
                            placeholder="Bambu printer code"
                            className="min-h-12 rounded-md border border-[#171717]/15 bg-white px-4 outline-none transition placeholder:text-[#9b968d] focus:border-[#0f766e]"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setPrinters((current) => current.length === 1 ? current : current.filter((_, printerIndex) => printerIndex !== index))}
                          disabled={printers.length === 1}
                          className="min-h-12 rounded-full border border-[#171717]/20 bg-white/65 px-4 text-xs font-bold uppercase tracking-[0.16em] transition hover:border-[#171717] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {supportedMaterials.map((material) => {
                          const selected = printer.selectedMaterials.includes(material);
                          return (
                            <label key={material} className={`grid gap-3 rounded-md border p-3 text-sm transition ${selected ? "border-[#0f766e] bg-white" : "border-[#171717]/15 bg-white/50"}`}>
                              <span className="flex items-center gap-2 font-semibold">
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => toggleMaterial(index, material)}
                                  className="h-4 w-4 accent-[#0f766e]"
                                />
                                {MATERIAL_LABELS[material]}
                              </span>
                              <input
                                value={printer.prices[material] || ""}
                                onChange={(event) => updatePrinter(index, {
                                  ...printer,
                                  prices: { ...printer.prices, [material]: event.target.value },
                                })}
                                disabled={!selected}
                                required={role === "seller" && selected}
                                min="0.01"
                                step="0.01"
                                type="number"
                                placeholder="INR per gram"
                                className="min-h-11 rounded-md border border-[#171717]/15 bg-white px-3 outline-none transition placeholder:text-[#9b968d] focus:border-[#0f766e] disabled:bg-[#f2eee7] disabled:text-[#9b968d]"
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => setPrinters((current) => {
                          const next = [...current];
                          next.splice(index + 1, 0, emptyPrinterState());
                          return next;
                        })}
                        aria-label="Add printer"
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d92d20] text-2xl font-semibold leading-none text-white shadow-sm transition hover:bg-[#b42318]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>

      <aside className="grid content-start gap-4 rounded-md border border-[#171717]/15 bg-white/65 p-5">
        <div>
          <p className="text-sm font-semibold">Selected path</p>
          <p className="mt-2 text-3xl font-semibold capitalize">{role}</p>
        </div>
        {role === "seller" ? (
          <div className="grid gap-4 rounded-md border border-[#171717]/15 bg-[#f7f2e8] p-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#686861]">Printer models owned</p>
              <p className="mt-2 text-sm font-semibold leading-6">{printerSummary(summaryPrinters)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#686861]">Allowed plastics</p>
              <p className="mt-2 text-sm font-semibold leading-6">{materialSummary(summaryPrinters)}</p>
            </div>
          </div>
        ) : null}
        <button disabled={loading} className="min-h-12 rounded-full bg-[#d92d20] px-6 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#b42318] disabled:cursor-wait disabled:opacity-50">
          {loading ? "Saving" : role === "buyer" ? "Enter marketplace" : "Save seller setup"}
        </button>
        {message ? <p className="rounded-md border border-[#d92d20]/25 bg-[#fff4f2] px-4 py-3 text-sm font-semibold text-[#b42318]">{message}</p> : null}
      </aside>
    </form>
  );
}
