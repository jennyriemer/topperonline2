/** Official Suburban Toppers wordmark. Native raster is 213×68 — never upscale. */

export const LOGO_SRC = "/suburban-toppers-logo.png";
export const LOGO_NATIVE_W = 213;
export const LOGO_NATIVE_H = 68;

export function BrandLogo({
  width = 160,
  compact = false,
}: {
  width?: number;
  compact?: boolean;
}) {
  const w = Math.min(width, LOGO_NATIVE_W);
  const h = Math.round((w * LOGO_NATIVE_H) / LOGO_NATIVE_W);
  return (
    <span
      className="inline-flex items-center justify-center bg-white shrink-0"
      style={{
        borderRadius: compact ? 8 : 999,
        padding: compact ? 4 : "6px 10px",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.35)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_SRC} alt="Suburban Toppers" width={w} height={h} style={{ display: "block", width: w, height: h }} />
    </span>
  );
}
