import { ImageResponse } from "next/og";
import { initials } from "@/lib/utils";
import { getProfile, getSiteSettings } from "@/server/queries/public";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon generated from the owner's initials, so rebranding needs no asset changes. */
export default async function Icon() {
  const [profile, settings] = await Promise.all([getProfile(), getSiteSettings()]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 16,
          background: "linear-gradient(135deg, #312e81, #4f46e5)",
          color: "white",
          fontSize: 28,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        {initials(profile?.fullName ?? settings.siteName)}
      </div>
    ),
    size,
  );
}
