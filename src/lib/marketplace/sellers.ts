import type { SupabaseClient } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
};

export function fallbackSellerName(ownerId: string | null) {
  if (!ownerId) return "Unknown seller";
  return `User ${ownerId.slice(0, 8)}`;
}

export async function getProfilesById(supabase: SupabaseClient, ownerIds: Array<string | null>) {
  const uniqueOwnerIds = Array.from(new Set(ownerIds.filter((id): id is string => Boolean(id))));

  if (uniqueOwnerIds.length === 0) {
    return new Map<string, Profile>();
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", uniqueOwnerIds)
    .returns<Profile[]>();

  return new Map((data || []).map((profile) => [profile.id, profile]));
}

export function displayNameForOwner(profiles: Map<string, Profile>, ownerId: string | null) {
  if (!ownerId) return fallbackSellerName(ownerId);
  return profiles.get(ownerId)?.display_name || fallbackSellerName(ownerId);
}
