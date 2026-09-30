import Image, { type ImageProps } from "next/image";
import { canOptimizeImage } from "@/lib/images";

/**
 * `next/image` that falls back to an unoptimized <img> for SVGs and hosts that
 * are not configured for optimization (e.g. an arbitrary URL typed in admin).
 */
export function SmartImage({ src, alt, ...props }: Omit<ImageProps, "src"> & { src: string }) {
  return <Image src={src} alt={alt} unoptimized={!canOptimizeImage(src)} {...props} />;
}
