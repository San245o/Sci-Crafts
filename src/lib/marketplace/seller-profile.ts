export type AccountType = "buyer" | "seller";

export type MaterialId =
  | "PLA"
  | "PETG"
  | "ABS"
  | "ASA"
  | "TPU"
  | "PC"
  | "PA_NYLON"
  | "PVA_SUPPORT"
  | "PET"
  | "CARBON_FIBER";

export type PrinterModelId =
  | "bambu-a1-mini"
  | "bambu-a1"
  | "bambu-p1p"
  | "bambu-p1s"
  | "bambu-x1-carbon"
  | "bambu-x1e"
  | "bambu-h2d";

export type MaterialRate = {
  material: MaterialId;
  pricePerGram: number;
};

export type SellerPrinter = {
  printerModel: PrinterModelId;
  serialNumber: string;
  materialRates: MaterialRate[];
};

export type PublicSellerPrinter = Omit<SellerPrinter, "serialNumber">;

export type SellerProfile = {
  id?: string;
  city: string | null;
  pincode: string | null;
  location: string | null;
  printers: SellerPrinter[] | null;
};

export type SellerAvailability = {
  id: string;
  city: string;
  pincode: string;
  location: string;
  printers: PublicSellerPrinter[];
  rating: number;
  rating_count: number;
  updated_at?: string;
};

export const TOP_MARKETPLACE_CITIES = [
  "Bengaluru",
  "Mumbai",
  "Delhi NCR",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
];

export const MATERIAL_LABELS: Record<MaterialId, string> = {
  PLA: "PLA",
  PETG: "PETG",
  ABS: "ABS",
  ASA: "ASA",
  TPU: "TPU",
  PC: "PC",
  PA_NYLON: "PA / Nylon",
  PVA_SUPPORT: "PVA / support materials",
  PET: "PET",
  CARBON_FIBER: "Carbon-fiber filaments",
};

export const BAMBU_PRINTERS: Array<{
  id: PrinterModelId;
  name: string;
  materials: MaterialId[];
}> = [
  {
    id: "bambu-a1-mini",
    name: "Bambu A1 mini",
    materials: ["PLA", "PETG", "TPU", "PVA_SUPPORT"],
  },
  {
    id: "bambu-a1",
    name: "Bambu A1",
    materials: ["PLA", "PETG", "TPU", "PVA_SUPPORT"],
  },
  {
    id: "bambu-p1p",
    name: "Bambu P1P",
    materials: ["PLA", "PETG", "TPU", "PVA_SUPPORT", "PET"],
  },
  {
    id: "bambu-p1s",
    name: "Bambu P1S",
    materials: ["PLA", "PETG", "TPU", "PVA_SUPPORT", "PET", "ABS", "ASA", "PA_NYLON", "PC"],
  },
  {
    id: "bambu-x1-carbon",
    name: "Bambu X1 Carbon / X1C",
    materials: ["PLA", "PETG", "TPU", "ABS", "ASA", "PC", "PA_NYLON", "CARBON_FIBER"],
  },
  {
    id: "bambu-x1e",
    name: "Bambu X1E",
    materials: ["PLA", "PETG", "ABS", "ASA", "PC", "PA_NYLON", "CARBON_FIBER"],
  },
  {
    id: "bambu-h2d",
    name: "Bambu H2D / H-series",
    materials: ["PLA", "PETG", "TPU", "ABS", "ASA", "PC", "PA_NYLON", "CARBON_FIBER"],
  },
];

const PRINTERS_BY_ID = new Map(BAMBU_PRINTERS.map((printer) => [printer.id, printer]));
const MATERIAL_IDS = new Set(Object.keys(MATERIAL_LABELS));

export function getPrinterName(printerModel: string) {
  return PRINTERS_BY_ID.get(printerModel as PrinterModelId)?.name || printerModel;
}

export function getSupportedMaterials(printerModel: string) {
  return PRINTERS_BY_ID.get(printerModel as PrinterModelId)?.materials || [];
}

export function isMarketplaceCity(city: string) {
  return TOP_MARKETPLACE_CITIES.includes(city);
}

export function isSellerProfileComplete(sellerProfile: SellerProfile | null | undefined) {
  if (!sellerProfile?.city?.trim() || !sellerProfile.pincode?.trim() || !sellerProfile.location?.trim()) {
    return false;
  }

  return normalizeSellerPrinters(sellerProfile.printers).printers.length > 0;
}

export function toPublicSellerPrinters(printers: SellerPrinter[]): PublicSellerPrinter[] {
  return printers.map(({ printerModel, materialRates }) => ({
    printerModel,
    materialRates,
  }));
}

export function lowestPrinterRate(printers: PublicSellerPrinter[] | SellerPrinter[] | null | undefined) {
  const rates = (printers || [])
    .flatMap((printer) => printer.materialRates || [])
    .map((rate) => rate.pricePerGram)
    .filter((rate) => Number.isFinite(rate) && rate > 0);

  return rates.length ? Math.min(...rates) : null;
}

export function printerSummary(printers: PublicSellerPrinter[] | SellerPrinter[] | null | undefined) {
  const printerNames = Array.from(new Set((printers || []).map((printer) => getPrinterName(printer.printerModel))));
  return printerNames.length ? printerNames.join(", ") : "No printers configured";
}

export function materialSummary(printers: PublicSellerPrinter[] | SellerPrinter[] | null | undefined) {
  const materials = Array.from(new Set(
    (printers || [])
      .flatMap((printer) => printer.materialRates || [])
      .map((rate) => MATERIAL_LABELS[rate.material]),
  ));

  return materials.length ? materials.join(", ") : "No plastics configured";
}

export function normalizeSellerPrinters(value: unknown): { printers: SellerPrinter[]; error?: string } {
  if (!Array.isArray(value)) {
    return { printers: [], error: "Add at least one supported Bambu Lab printer." };
  }

  const printers: SellerPrinter[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") {
      return { printers: [], error: "Printer details are invalid." };
    }

    const record = item as Record<string, unknown>;
    const printerModel = typeof record.printerModel === "string" ? record.printerModel : "";
    const printer = PRINTERS_BY_ID.get(printerModel as PrinterModelId);

    if (!printer) {
      return { printers: [], error: "Only the listed Bambu Lab printer models are supported." };
    }

    const serialNumber = typeof record.serialNumber === "string" ? record.serialNumber.trim() : "";
    if (serialNumber.length < 4 || serialNumber.length > 120) {
      return { printers: [], error: "Each printer needs a valid serial number." };
    }

    const materialRates = Array.isArray(record.materialRates) ? record.materialRates : [];
    const seenMaterials = new Set<MaterialId>();
    const normalizedRates: MaterialRate[] = [];

    for (const rateItem of materialRates) {
      if (!rateItem || typeof rateItem !== "object") {
        return { printers: [], error: "Material pricing is invalid." };
      }

      const rate = rateItem as Record<string, unknown>;
      const material = typeof rate.material === "string" ? rate.material : "";
      const pricePerGram = Number(rate.pricePerGram);

      if (!MATERIAL_IDS.has(material) || !printer.materials.includes(material as MaterialId)) {
        return { printers: [], error: `${printer.name} has an unsupported material selected.` };
      }

      if (!Number.isFinite(pricePerGram) || pricePerGram <= 0 || pricePerGram > 100000) {
        return { printers: [], error: "Every selected material needs a positive INR per gram price." };
      }

      if (!seenMaterials.has(material as MaterialId)) {
        seenMaterials.add(material as MaterialId);
        normalizedRates.push({
          material: material as MaterialId,
          pricePerGram: Math.round(pricePerGram * 100) / 100,
        });
      }
    }

    if (normalizedRates.length === 0) {
      return { printers: [], error: `Add at least one material price for ${printer.name}.` };
    }

    printers.push({
      printerModel: printer.id,
      serialNumber,
      materialRates: normalizedRates,
    });
  }

  if (printers.length === 0) {
    return { printers: [], error: "Add at least one supported Bambu Lab printer." };
  }

  return { printers };
}
