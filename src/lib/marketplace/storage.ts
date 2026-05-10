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
  const urlsByPath = await createSignedUrlMap(supabase, bucket, paths);
  return paths
    .map((path) => urlsByPath.get(path))
    .filter((url): url is string => Boolean(url));
}

export async function createSignedUrlMap(
  supabase: SupabaseClient,
  bucket: string,
  paths: string[],
) {
  const urlsByPath = new Map<string, string>();
  const uniquePaths = Array.from(new Set(paths));
  const localPaths = uniquePaths.filter(isLocalPublicAsset);
  const storagePaths = uniquePaths.filter((path) => !isLocalPublicAsset(path));

  localPaths.forEach((path) => urlsByPath.set(path, path));

  if (storagePaths.length === 0) {
    return urlsByPath;
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(storagePaths, SIGNED_URL_TTL_SECONDS);

  if (error) return urlsByPath;

  data.forEach((item) => {
    if (item.path && item.signedUrl) {
      urlsByPath.set(item.path, item.signedUrl);
    }
  });

  return urlsByPath;
}

export function getPublicUrl(
  supabase: SupabaseClient,
  bucket: string,
  path: string | null,
) {
  if (!path) return null;
  if (isLocalPublicAsset(path)) return path;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function getPublicUrlMap(
  supabase: SupabaseClient,
  bucket: string,
  paths: string[],
) {
  return new Map(
    Array.from(new Set(paths)).map((path) => [
      path,
      getPublicUrl(supabase, bucket, path),
    ]),
  );
}

export function getPublicUrls(
  supabase: SupabaseClient,
  bucket: string,
  paths: string[],
) {
  const urlsByPath = getPublicUrlMap(supabase, bucket, paths);
  return paths
    .map((path) => urlsByPath.get(path))
    .filter((url): url is string => Boolean(url));
}
