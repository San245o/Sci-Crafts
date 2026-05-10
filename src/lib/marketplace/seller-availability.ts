import type { SupabaseClient } from "@supabase/supabase-js";
import {
  lowestPrinterRate,
  type SellerAvailability,
} from "./seller-profile";

export async function getSellerAvailability(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("seller_availability")
    .select("id, city, pincode, location, printers, rating, rating_count, updated_at")
    .order("city", { ascending: true })
    .returns<SellerAvailability[]>();

  return (data || []).map((seller) => ({
    ...seller,
    printers: Array.isArray(seller.printers) ? seller.printers : [],
    rating: Number(seller.rating) || 0,
    rating_count: Number(seller.rating_count) || 0,
  }));
}

export function sortSellerAvailability<T extends SellerAvailability>(sellers: T[], selectedCity = "") {
  return [...sellers].sort((a, b) => {
    if (selectedCity) {
      const aMatch = a.city === selectedCity ? 0 : 1;
      const bMatch = b.city === selectedCity ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
    }

    const cityCompare = a.city.localeCompare(b.city);
    if (cityCompare !== 0) return cityCompare;

    const ratingCompare = b.rating - a.rating;
    if (ratingCompare !== 0) return ratingCompare;

    return a.location.localeCompare(b.location);
  });
}

export function availabilityCities(sellers: SellerAvailability[]) {
  return Array.from(new Set(sellers.map((seller) => seller.city))).sort((a, b) => a.localeCompare(b));
}

export function sellerStartingPrice(seller: SellerAvailability) {
  return lowestPrinterRate(seller.printers);
}
