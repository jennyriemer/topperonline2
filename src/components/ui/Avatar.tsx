import { cn, getInitials } from "@/lib/utils";

const PALETTES = [
  { bg: "#DCE7F7", fg: "#0B3E85" },
  { bg: "#F1EAFF", fg: "#6A3FD1" },
  { bg: "#E0FCED", fg: "#007D53" },
  { bg: "#FFF4BF", fg: "#8A7200" },
  { bg: "#E0F6FC", fg: "#007A9C" },
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
