/**
 * Remote hosts served through the Next.js image optimizer. Kept in one place so
 * `next.config.ts` and <SmartImage> agree; any other host renders unoptimized
 * instead of throwing at runtime.
 */
export const OPTIMIZED_REMOTE_HOSTS = [
  "**.public.blob.vercel-storage.com",
  "images.unsplash.com",
  "avatars.githubusercontent.com",
] as const;

function hostMatches(host: string, pattern: string): boolean {
  if (pattern.startsWith("**.")) {
    const base = pattern.slice(3);
    return host === base || host.endsWith(`.${base}`);
  }
  return host === pattern;
}

export function canOptimizeImage(src: string): boolean {
  if (src.toLowerCase().split("?")[0]!.endsWith(".svg")) return false;
  if (src.startsWith("/")) return true;
  try {
    const { hostname, protocol } = new URL(src);
    return protocol === "https:" && OPTIMIZED_REMOTE_HOSTS.some((pattern) => hostMatches(hostname, pattern));
  } catch {
    return false;
  }
}
