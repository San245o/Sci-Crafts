import type { SupabaseClient } from "@supabase/supabase-js";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

function isLocalPublicAsset(path: string) {
  return path.startsWith("/");
}

export async function createSignedUrl(
  supabase: SupabaseClient,
  bucket: string,
  path: string | null,
  download = false,
) {
  if (!path) return null;
  if (isLocalPublicAsset(path)) return path;

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS, { download });

  if (error) return null;
  return data.signedUrl;
}

export async function createSignedUrls(
  supabase: SupabaseClient,
  bucket: string,
  paths: string[],
) {
  const urls = await Promise.all(paths.map((path) => createSignedUrl(supabase, bucket, path)));
  return urls.filter((url): url is string => Boolean(url));
}
