import { cn, getInitials } from "@/lib/utils";

const PALETTES = [
  { bg: "#579bfc", fg: "#fff" },
  { bg: "#a25ddc", fg: "#fff" },
  { bg: "#00c875", fg: "#fff" },
  { bg: "#fdab3d", fg: "#fff" },
  { bg: "#007eb5", fg: "#fff" },
  { bg: "#e2445c", fg: "#fff" },
  { bg: "#ffcb00", fg: "#323338" },
];

export function Avatar({
  name,
  size = 20,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const i = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTES.length;
  const p = PALETTES[i];
  return (
    <span
      className={cn("inline-flex items-center justify-center rounded-full shrink-0 font-medium", className)}
      style={{
        width: size,
        height: size,
        background: p.bg,
        color: p.fg,
        fontSize: size < 22 ? 9 : 11,
        lineHeight: 1,
        boxShadow: "0 0 0 2px #fff",
      }}
      aria-hidden
    >
      {getInitials(name)}
    </span>
  );
}
